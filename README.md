# grunt-wpt

> Grunt plugin for continuously measurement of WebPageTest

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-wpt --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-wpt');
```

## The "wpt" task

### Overview
In your project's Gruntfile, add a section named `wpt` to the data object passed into `grunt.initConfig()`.
Plugin output JSON and HTML to `dest` which summarized results after executing WebPageTest.

```js
grunt.initConfig({
  wpt: {
    options: {
      locations: ['Tokyo', 'SanJose_IE9'],
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
      dest: 'tmp/sideroad/'
    }
  }
});
```

### Options

#### options.locations
Type: `Array` of `String`
Default value: `['SanJose_IE9']`

Array of testing locations

#### options.URL
Type: `Array` of `String`
Default value: `[]`

Array of testing URL
*Required

If you want to know more detail, please see also [WebPageTest API](https://github.com/marcelduran/webpagetest-api)

## Examples
http://sideroad.github.io/sample-wpt-page/

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
