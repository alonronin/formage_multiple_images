'use strict';
var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types,
    async = require('async');

var schema = new Schema({
    language: { type: String, ref: 'language', default: 'he' },
    parent: { type: Types.ObjectId, ref: 'navigation', limit: 1000 },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    url: { type: String, trim: true, lowercase: true, unique: true },
    order: { type: Number, editable: false, default: 0 },
    menu: { type: Boolean, 'default': true },
    show: { type: Boolean, 'default': true },
    meta: [{
        name: { type: String },
        content: { type: Types.Text }
    }]
});

schema.methods.toString = function(){
    return this.title;
};

schema.statics.findRecursive = function(language, cb) {
    this.find({ language: language, show: true, menu: true })
        .select('order parent url title description')
        .sort({ parent: -1, order: 1 })
        .lean()
        .exec(function(err, items) {
            if (err) cb(err);

            var o = {};
            items.forEach(function(item) {
                item.sub = {items: []};
                o[item._id] = item;
            });
            for (var i in o) {
                var item = o[i];
                if (item.parent) {
                    o[item.parent] && o[item.parent].sub.items.push(item);
                    delete o[i];
                }
            }
            cb(null, _.values(o));
        });
};

/*
    Find crumbs of current page,
    assumed to be at `res.locals.page`
    results at
        `res.locals.crumbs`
 */
schema.statics.crumbs = function() {
    var nav = this;

    return function(req, res, next) {
        function parent(id) {
            var q = nav.findById(id).select('parent url title').lean().exec();

            q.then(function(page, err) {
                    if (err) return next(err);
                    if (page) {
                        crumbs.push(page);
                        return parent(page.parent);
                    }
                    res.locals.crumbs = crumbs.reverse();
                    next();
                });
        }
        var crumbs = [];

        if (res.locals.page && res.locals.page.post) {
            crumbs.push(res.locals.page.post);
        }

        if (res.locals.page) {
            crumbs.push(res.locals.page);
            parent(res.locals.page.parent);
        }
        else next();
    };
};

schema.statics.menu = function(){
    var navigation = this;
    return function(req, res, next) {
        var crumbs = res.locals.crumbs;
        var language = res.locals.language;

        navigation.findRecursive(language._id, function(err, menu) {
            menu.forEach(function(item, i){
                item.dock = (crumbs&&crumbs[0]&&crumbs[0]._id.toString() === item._id.toString());
                item.last = (i + 1 == menu.length);
            });

            if(menu) res.locals.menu = {items: menu};
            next(err);
        });
    };
};

schema.pre('validate', function(next) {
    var url = this.url;

    if (!url)
        url = '/' + this.title;

    url = url.replace(/[\?\'\"\@\!\#\$\%\^\&\*\(\)\+\=\_\~\{\}\[\]\\\|\,\;\:]/g, "")
        .replace(/ +/g, "-")
        .replace(/\-+/g, '-')
        .replace(/(?:^\-|\-$)/g, '');

    if (url.substr(0,1) !== '/')
        url = '/' + url;

    this.url = url.toLowerCase();

    next();
});

schema.path('url').validate(function(v, callback){
    var self = this;
    async.each(['posts', 'navigation'], function(item, cb){
        var query = self.db.model(item).findOne().where('url', self.url);

        if('navigation' == item) query.ne('_id', self._id);

        query.exec(function(err, url){
            cb(err || url);
        });

    }, function(err){
        callback(!err);
    });
}, 'url already exists');

schema.formage = {
    list: ['title', 'parent', 'language', 'url', 'template', 'menu', 'show'],
    order_by: ['order'],
    sortable: 'order',
    list_populate: ['language', 'parent']
};

module.exports = schema;

