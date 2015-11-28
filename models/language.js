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

schema.statics.middlware = function(){
    var language = this;

    return function(req, res, next){
        language.find({ active: true })
            .sort({ order: 1 })
            .lean()
            .exec(function(err, items) {
                _.forEach(items, function(item, key){ item.last = key === items.length - 1; });

                if(items) {
                    res.locals.language = req.session.language || items[0];
                    res.locals.languages = { items: items };
                }

                next(err);
            })
    }
};

schema.formage = {
    list: ['name','url','active'],
    order_by: ['order'],
    sortable: 'order',
    section: 'Configuration'
};

module.exports = schema;