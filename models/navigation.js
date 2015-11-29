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

