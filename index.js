/*jslint node: true, strict:implied, esversion:6 */

var request = require('request'),
    path = require('path'),
    //log = require(path.resolve('app/services/log')),
    //onError = require(path.resolve('app/services/on-error')),
    env = process.env.NODE_ENV,
    envConfig = require(path.resolve('config/env/' + env + '-config.js')),
    template = null;


function insertDevelopmentStyles(reqTemplate) {

    if (envConfig.stylesheets) {

        let cssLinks = [];

        for (let i = 0, l = envConfig.stylesheets.length; i < l; i++) {

            var cssLink = `<link
                rel="stylesheet"
                media="all"
                href="${envConfig.stylesheets[i]}" />`;

            cssLinks.push(cssLink);

        }

        var result = cssLinks.join('\n');

        //console.log(reqTemplate, reqTemplate);



        return reqTemplate[0].replace('<!--[STYLESHEETS]-->', result);

    }

    return '';

}

function loadTemplate(req, res, next) {

    if (template) {

        req.TEMPLATE = template;
        // assign cached templat to request
        return next();

    }

	var templateUrl = envConfig.templateUrl;

    request({url: templateUrl}, function(err, res, body) {

        if(!err && res.statusCode === 200) {

            req.TEMPLATE = body.split('[CONTENT]');

            var upperTemplate;

            if (env === 'development') {
                req.TEMPLATE[0] = insertDevelopmentStyles(req.TEMPLATE);
            }

            next();

        } else {

            console.error(err);
            console.error(err.stack);

            next();
        }
    });

}

module.exports = loadTemplate;
