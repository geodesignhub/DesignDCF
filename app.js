var express = require("express");
var req = require('request');
var async = require('async');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var ejs = require('ejs');
var csrf = require('csurf');
var app = express();
app.set('view engine', 'ejs');
// app.use(express.static(__dirname + '/views'));
app.use('/assets', express.static('static'));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());
app.use(csrf({ cookie: true }));

app.get('/', function(request, response) {
    var opts = {};
    if (request.query.apitoken && request.query.projectid && request.query.synthesisid && request.query.cteamid) {
        // var baseurl = 'https://www.geodesignhub.com/api/v1/projects/';
        var baseurl = 'http://local.test:8000/api/v1/projects/';

        var apikey = request.query.apitoken;
        var cred = "Token " + apikey;
        var projectid = request.query.projectid;
        var cteamid = request.query.cteamid;
        var synthesisid = request.query.synthesisid;
        var synprojectsurl = baseurl + projectid + '/cteams/' + cteamid + '/' + synthesisid + '/';
        var timelineurl = baseurl + projectid + '/cteams/' + cteamid + '/' + synthesisid + '/timeline/';
        var systemsurl = baseurl + projectid + '/systems/';
        var boundsurl = baseurl + projectid + '/bounds/';
        var boundaryurl = baseurl + projectid + '/boundaries/';
        var syndiagramsurl = baseurl + projectid + '/cteams/' + cteamid + '/' + synthesisid + '/diagrams/';
        var projecturl = baseurl + projectid + '/';
        var URLS = [synprojectsurl, boundsurl, timelineurl, systemsurl, projecturl, syndiagramsurl, boundaryurl];

        async.map(URLS, function(url, done) {
            req({
                url: url,
                headers: {
                    "Authorization": cred,
                    "Content-Type": "application/json"
                }
            }, function(err, response, body) {
                if (err || response.statusCode !== 200) {
                    return done(err || new Error());
                }
                return done(null, JSON.parse(body));
            });
        }, function(err, results) {
            if (err) return response.sendStatus(500);

            var sURls = [];
            var systems = results[3];
            for (x = 0; x < systems.length; x++) {
                var curSys = systems[x];
                var systemdetailurl = baseurl + projectid + '/systems/' + curSys['id'] + '/';
                sURls.push(systemdetailurl);
            }

            async.map(sURls, function(url, done) {
                req({
                    url: url,
                    headers: {
                        "Authorization": cred,
                        "Content-Type": "application/json"
                    }
                }, function(err, response, body) {
                    if (err || response.statusCode !== 200) {
                        return done(err || new Error());
                    }
                    return done(null, JSON.parse(body));
                });
            }, function(err, sysdetails) {
                if (err) return response.sendStatus(500);
                var timeline = results[2]['timeline'];
                opts = {
                    "csrfToken": request.csrfToken(),
                    "apitoken": request.query.apitoken,
                    "projectid": request.query.projectid,
                    "status": 1,
                    "design": JSON.stringify(results[0]),
                    "bounds": JSON.stringify(results[1]),
                    "systems": JSON.stringify(results[3]),
                    "timeline": JSON.stringify(timeline),
                    "projectdetails": JSON.stringify(results[4]),
                    "syndiagrams": JSON.stringify(results[5]),
                    "boundaries": JSON.stringify(results[6].geojson),
                    "systemdetail": JSON.stringify(sysdetails),
                };
                response.render('designdcf', opts);
            });

        });

    } else {
        opts = { 'csrfToken': request.csrfToken(), 'boundaries': '0', 'systemdetail': '0', 'apitoken': '0', 'projectid': '0', 'cteamid': '0', "diagramdetail": '0', 'systems': '0', 'synthesisid': '0', "projectdetails": '0' };
        response.render('designdcf', opts);
    }

});



app.listen(process.env.PORT || 5001);