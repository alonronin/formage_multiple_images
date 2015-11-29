'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types;

var schema = new Schema({
    language: { type: String, ref: 'language', default: 'he', hide: true },
    site: {
        logo: {type: Types.Filepicker, widget: 'FilepickerPictureWidget'},
        icon: {type: Types.Filepicker, widget: 'FilepickerPictureWidget'},
        name: String,
        homepage: String,
        copyrights: String,
        phone: String,
        email: String,
        social: [{
            title: String,
            description: String,
            url: String
        }]
    },
    address: { type: Types.GeoPoint },
    social: [{
        url: String
    }],
    footer: [{
        title: String,
        links: [{
            title: String,
            url: String
        }]
    }],
    constants: {
        name: String,
        email: String,
        subject: String,
        message: String,
        send: String,
        information: String,
        social: String,
        contact_us: String,
        read_more: String,
        our_team: String,
        sent: String
    },
    contact: {
        email: String,
        subject: String
    },
    snippets: [Types.Text],
    _404: {
        title: String,
        content: Types.Html
    }
});

schema.formage = {
    list: ['language', 'site.name', 'site.logo'],
    list_populate: ['language'],
    section: 'Configuration'
};

module.exports = schema;

