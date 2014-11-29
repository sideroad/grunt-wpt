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
          runs: 5,
          video: 1
        }),
        done = this.async(),
        wpt = new WebPageTest(options.server);

    // Should be tested more than 2 times for getting median data
    if(options.runs < 2){
      options.runs = 2;
    }

    this.files.forEach(function(f) {
      var resultsPath = path.join( f.dest, 'tests', 'results.json' ),
          locationsPath = path.join( f.dest, 'tests', 'locations.json'),
          isAlreadyExists = fs.existsSync(resultsPath),
          results,
          locations;

      grunt.file.copy( path.join(__dirname, 'public', 'index.html'), path.join( f.dest, 'index.html' ) );
      wrench.copyDirSyncRecursive(path.join(__dirname, 'public', 'build'), path.join( f.dest, 'build' ), {
        forceDelete: true
      });

      if(!isAlreadyExists){
          grunt.log.debug('Initialize dest directory['+path.resolve( f.dest )+'] from '+path.join(__dirname, 'public'));
          wrench.mkdirSyncRecursive( path.join( f.dest, 'tests' ));
          grunt.file.write(resultsPath, '{}');
          grunt.file.write(locationsPath, '{}');
      }
      results = grunt.file.readJSON( resultsPath );
      locations = grunt.file.readJSON(locationsPath );

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
                locations[location] = location;
                grunt.file.write(path.join( path.join( f.dest, 'tests'), id+".json" ), JSON.stringify( data ));

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
        grunt.file.write(locationsPath, JSON.stringify( locations ));
        grunt.file.write(resultsPath, JSON.stringify( results ));
        done(true);
      });
    });
  });

};
