'use strict';

var mongoose = require('mongoose');
var util = require('util');
var formage = require('formage');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var _ = require('lodash');

var FilepickerGalleryWidget = formage.widgets.InputWidget.extend({
    init: function (options) {
        this._super('filepicker', options);
        this.attrs['data-fp-button-class'] = "btn btn-primary";
        this.attrs['data-fp-multiple'] = true;
        this.attrs['data-fp-mimetypes'] = 'image/*';
        this.attrs['onchange'] = 'gallery_on_change(event)';
    },

    render: function (res) {
        this._super(res);

        var script = "function gallery_on_change(e){ $(e.target).val( e.fpfiles); }";
        res.write('<script>' + script + '</script>');
    }
});

var FilepickerGalleryField = formage.fields.FilepickerField.extend({
    init: function (options) {
        options = options || {};
        options.widget = FilepickerGalleryWidget;
        this._super(options);
    },
    clean_value: function (req, callback) {
        this._super(req, callback);
    },
    bind: function(){
        this.value || (this.value = '');
        this.value = JSON.stringify(this.value);
    },
    unbind: function () {
        console.log(this.value);
    }
});

var schema = new Schema({
    navigation: { type: Types.ObjectId, ref: 'navigation' },
    title: { type: String },
    pictures: {type: Types.Mixed, formageField: FilepickerGalleryField },
    order: { type: Number, editable: false },
    show: { type: Boolean, default: true }
});

schema.methods.toString = function(){
    return this.title;
};

schema.statics.byNavigationId = function(){
    var gallery = this;
    return function(res, cb){
        var page = res.locals.page;

        gallery
            .find()
            .where('navigation', page._id)
            .where('show', 1)
            .sort({'order': 1})
            .lean()
            .exec(function(err, results){
                if(results.length) res.locals.page.galleries = {items :results};
                cb(err);
            });
    };
};

schema.statics.byGalleryId = function(id){
    var gallery = this;
    return function(res, cb){
        var crumbs = res.locals.crumbs;
        gallery
            .find()
            .where('show', 1)
            .lean()
            .exec(function(err, result){
                if(result) {
                    _.forEach(result, function(object, i){
                        if(object._id == id) {
                            res.locals.page.gallery = object;
                            res.locals.page.prev = result[i - 1] ? result[i - 1] : null;
                            res.locals.page.next = result[i + 1] ? result[i + 1] : null;
                            crumbs.push( {title: object.title, url: '' } );
                        }
                    });

                }
                cb(err);
            });
    };
};


schema.formage = {
    list: ['navigation', 'title', 'text', 'show'],
    list_populate: ['navigation'],
    order_by: ['order'],
    sortable: 'order'
};

module.exports = schema;

