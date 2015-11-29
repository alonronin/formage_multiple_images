var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types,
    _ = require('lodash');

var schema = new Schema({
    _id: { type: String, unique: true },
    name: { type: String, unique: true },
    direction: { type: String, enum: ['rtl', 'ltr'], default: 'ltr' },
    url: { type: String },
    order: { type: Number, editable: false, default: 0 },
    active: { type: Boolean, default: true }
});

schema.methods.toString = function(){
    return this.name;
};

schema.formage = {
    list: ['name','url','active'],
    order_by: ['order'],
    sortable: 'order',
    section: 'Configuration'
};

module.exports = schema;