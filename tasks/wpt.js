/*
 * grunt-wpt
 * https://github.com/sideroad/grunt-wpt
 *
 * Copyright (c) 2013 sideroad
 * Licensed under the MIT license.
 */

'use strict';
var async = require('async'),
    WebPageTest = require('webpagetest'),
    fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    _ = require('lodash');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('wpt', 'Webpagetest', function() {    
    var options = this.options({
          server: 'www.webpagetest.org',
          locations: ['Dulles_IE10'],
          pollResults: 5,
          timeout: 360,
          runs: 5
        }),
        done = this.async(),
        initialize = function(dest){
          grunt.log.debug('Initialize dest directory['+path.resolve( dest )+'] from '+path.join(__dirname, 'base'));
          wrench.mkdirSyncRecursive(dest);
          wrench.copyDirSyncRecursive(path.join(__dirname, 'public'), path.join( dest, 'public' ) );
        },
        wpt = new WebPageTest(options.server);

    // Test should be more than 2 times for getting median data
    if(options.runs < 2){
      options.runs = 2;
    }

    this.files.forEach(function(f) {
      var resultsPath = path.join(path.join( f.dest, 'public' ), 'results.json'),
          locationsPath = path.join(path.join( f.dest, 'public' ), 'locations.json'),
          isAlreadyExists = fs.existsSync(resultsPath),
          results = {},
          locations = {};

      if(!isAlreadyExists){
        initialize(f.dest);
      }
      results = JSON.parse( fs.readFileSync(resultsPath, 'utf-8') );
      locations = JSON.parse( fs.readFileSync(locationsPath, 'utf-8') );

      async.mapSeries(options.locations, function(location, callback){
        if(!results[location]){
          results[location] = {};
        }
        async.mapSeries(options.url, function(url, callback){
          if(!results[location][url]){
            results[location][url] = [];
          }
          async.waterfall([
            function(callback){
              grunt.log.writeln('Running webpagetest server['+url+'] location['+location+']');
              wpt.runTest(url, _.extend({
                location: location,
                breakDown: true,
                pageSpeed: true
              }, options), function(err, data) {
                var testId;
                if(err || data.response.statusCode === 400){
                  callback(err || data.response.statusText);
                  return;
                }

                testId = data.response.data.testId;
                results[location][url].unshift(testId);
                grunt.log.debug("Finished test[ "+testId+ "]");
                callback(null, testId);
              });
            },
            function(id, callback){
              wpt.getTestResults( id, {
                breakDown: true,
                pageSpeed: true
              }, function(err, data){
                if(err){
                  callback(err);
                  return;
                }
                grunt.log.debug("Get test results");

                callback(null, id, data);
              });
            },
            function(id, data, callback){
              wpt.getTestInfo( id, function(err, info){
                if(err){
                  callback(err);
                  return;
                }
                data.info = info;
                locations[location] = info.locationLabel;

                grunt.log.debug("Get test info");

                fs.writeFileSync(path.join( path.join( f.dest, 'public/tests'), id+".json" ), JSON.stringify( data ), 'utf-8');
                callback(null, true);
              });
            }
          ], function(err){
            callback(err);
          });
        }, function(err){
          callback(err);
        });
      }, function(err){
        if(err) {
          grunt.log.error(JSON.stringify( err ));
          done(false);
        }
        fs.writeFileSync(locationsPath, JSON.stringify( locations ));
        fs.writeFileSync(resultsPath, JSON.stringify( results ));
        done(true);
      });
    });
  });

};
