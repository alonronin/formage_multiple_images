'use strict';

var pkg = require('./package.json');
var express = require('express');
var path = require('path');
var debug = require('debug')(pkg.name + ':app');
var logger = require('morgan');
var mongoose = require('mongoose');
var formage = require('formage');
var models = require('./models');
var http = require('http');
var _ = require('lodash');

var app = module.exports = express();

app.set('site', _.startCase(pkg.name));
app.set('secret', pkg.name + ' secret');
app.set('mongo', process.env.MONGOLAB_URI || 'mongodb://localhost/' + pkg.name);
app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser(app.get('secret')));
app.use(express.cookieSession({cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }}));

formage.init(app, express, models, {
    root: '/admin',
    title: app.get('site') + ' Admin',
    username: process.env.ADMIN_USER || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin',
    admin_users_gui: true,
    default_section: 'Cms'
});

mongoose.connect(app.get('mongo'));

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {

        res.status(err.status || 500);

        if(res.statusCode === 500) {
            if (err) debug(err);

            return res.json({
                message: err.message,
                error: err
            });
        }

        res.render('404');
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    if(res.status === 500)
        return res.json({
            message: err.message,
            error: {}
        });

    res.render('404');
});