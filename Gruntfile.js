/*
 * grunt-wpt
 * https://github.com/sideroad/grunt-wpt
 *
 * Copyright (c) 2013 sideroad
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['pages'],
    },

    // Configuration to be run (and then tested).
    wpt: {
      options: {
        locations: ['Dulles_IE10'],
        runs: 2,
        key: process.env.WPT_API_KEY
      },
      sideroad: {
        options: {
          url: [
            'http://sideroad.secret.jp/',
            'http://sideroad.secret.jp/articles/',
            'http://sideroad.secret.jp/plugins/'
          ]
        },
        dest: 'pages/sideroad/'
      },
      github: {
        options: {
          url: [
            'http://github.com/',
            'http://github.com/sideroad/',
          ]
        },
        dest: 'pages/github/'
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-release');

  // Whenever the 'test' task is run, first clean the 'tmp' dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'wpt']);

};
