'use strict';

var mongoose = require('mongoose');
var util = require('util');
var formage = require('formage');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var _ = require('lodash');

var FilepickerGalleryWidget = formage.widgets.InputWidget.extend({
    init: function (options) {
        this._super('hidden', options);
        this.attrs['data-fp-button-class'] = "btn btn-primary";
    },

    render: function (res) {
        this._super(res);
        this.value || (this.value = []);

        this.value = JSON.parse(this.value);

        res.write('<input type="filepicker" data-fp-button-class="btn btn-primary" data-fp-multiple="true" data-fp-mimetype="image/*" onchange="gallery_onchange(event, \''+ this.name+'\')" />');
        res.write('<button class="btn btn-danger delete_all_pictures" data-name="'+ this.name +'">Delete All</button>');
        res.write('<br>');

        var script = "";
        res.write('<script>'+ script +'</script>');

        res.write('<div id="gallery_'+ this.name +'" style="float:left; margin-top: 20px;">');

        _.forEach(this.value, function(item, index){
            res.write(_.template('<p><a href="${ url }" target="_blank"><img class="img-polaroid" src="${ url }/convert?w=150&h=110"/></a> <button class="btn btn-danger delete_picture" data-name="'+ this.name +'" data-index="'+ index +'">Delete</button></p>')(item.picture));
        }, this);

        res.write('</div>');
    }
});

var FilepickerGalleryField = formage.fields.FilepickerField.extend({
    init: function (options) {
        options = options || {};
        options.widget = FilepickerGalleryWidget;
        this._super(options);

        this.header_lines || (this.header_lines = []);
        this.header_lines.push('<script src="/admin/js/gallery_widget.js"></script>');
    },
    bind: function(data){
        this._super(data);
        this.value || (this.value = []);
        this.value = JSON.stringify(this.value);
    },
    unbind: function () {
        this._super();
        console.log(this.value);
    }
});

var schema = new Schema({
    navigation: { type: Types.ObjectId, ref: 'navigation' },
    title: { type: String },
    pictures: {type: Object, formageField: FilepickerGalleryField },
    gallery: {type: Object, formageField: FilepickerGalleryField },
    order: { type: Number, editable: false },
    show: { type: Boolean, default: true }
});

schema.methods.toString = function(){
    return this.title;
};


schema.formage = {
    list: ['navigation', 'title', 'text', 'show'],
    list_populate: ['navigation'],
    order_by: ['order'],
    sortable: 'order'
};

module.exports = schema;

