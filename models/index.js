var path = require('path');
var fs = require('fs');
var files = fs.readdirSync(__dirname);
var mongoose = require('mongoose');
var _ = require('lodash');

_.forEach(files, function(file) {
    var name = path.basename(file, '.js');
    if (name === 'index')
        return;

    module.exports[name] = mongoose.model(name, require('./' + name));
});