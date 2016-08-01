'use strict';

var isTravis = process.env.CI || process.env.TRAVIS;

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var npm = require('npm-install-global');
var del = require('delete');
var generator = require('..');
var app;

var fixtures = path.resolve.bind(path, __dirname, '../templates');
var actual = path.resolve.bind(path, __dirname, 'actual');

function exists(name, cb) {
  return function(err) {
    if (err) return cb(err);
    var filepath = actual(name);
    fs.stat(filepath, cb);
  };
}

describe('generate-engine', function() {
  this.slow(250);

  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('generate', cb);
    });
  }

  beforeEach(function() {
    app = generate({silent: true});
    app.cwd = actual();
    app.option('dest', actual());
    app.option('askWhen', 'not-answered');
    app.option('srcBase', fixtures());
    app.data('moduleName', 'faux');
    app.data('engineName', 'faux');
    app.data('engineExt', 'faux');
    app.use(require('verb-repo-data'));
  });

  before(function(cb) {
    del(actual(), cb);
  });

  afterEach(function(cb) {
    del(actual(), cb);
  });

  describe('tasks', function() {
    it('should extend tasks onto the instance', function() {
      app.use(generator);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('engine'));
    });

    it('should run the `default` task with .build', function(cb) {
      app.use(generator);
      app.build('default', exists('index.js', cb));
    });

    it('should run the `default` task with .generate', function(cb) {
      app.use(generator);
      app.generate('default', exists('index.js', cb));
    });
  });

  describe('generator (CLI)', function() {
    it('should run the default task using the `generate-engine` name', function(cb) {
      if (isTravis) return this.skip();
      app.use(generator);
      app.generate('generate-engine', exists('index.js', cb));
    });

    it('should run the default task using the `engine` generator alias', function(cb) {
      if (isTravis) return this.skip();
      app.use(generator);
      app.generate('engine', exists('index.js', cb));
    });
  });

  describe('engine (API)', function() {
    it('should generate an index.js file', function(cb) {
      app.register('engine', generator);
      app.generate('engine:index', exists('index.js', cb));
    });

    it('should generate a test.js file', function(cb) {
      app.register('engine', generator);
      app.generate('engine:test', exists('test/test.js', cb));
    });

    it('should generate test fixtures', function(cb) {
      app.register('engine', generator);
      app.generate('engine:fixtures', exists('test/fixtures/content.tmpl', cb));
    });

    it('should run the default task on the generator', function(cb) {
      app.register('engine', generator);
      app.generate('engine', exists('index.js', cb));
    });

    it('should run the `engine` task', function(cb) {
      app.register('engine', generator);
      app.generate('engine:engine', exists('index.js', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('engine', generator);
      app.generate('engine:default', exists('index.js', cb));
    });
  });

  describe('sub-generator', function() {
    it('should work as a sub-generator', function(cb) {
      app.register('foo', function(foo) {
        foo.register('engine', generator);
      });
      app.generate('foo.engine', exists('index.js', cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('engine', generator);
      });
      app.generate('foo.engine', exists('index.js', cb));
    });

    it('should run the `generator:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('engine', generator);
      });
      app.generate('foo.engine:default', exists('index.js', cb));
    });

    it('should run the `generator:engine` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('engine', generator);
      });
      app.generate('foo.engine:engine', exists('index.js', cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', generator)
        .register('bar', generator)
        .register('baz', generator);
      app.generate('foo.bar.baz', exists('index.js', cb));
    });
  });
});
