---
rename:
  dirname: test
  basename: test.js
---
'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var engine = require('..');

describe('<%= name %>', function() {
  describe('.compileSync()', function() {
    it('should compile templates synchronously', function() {
      var fn = engine.compileSync('<%= name %>');
      assert.equal(typeof fn, 'function');
      assert.equal(fn({name: '<%= name %>'}), '<%= name %>');
    });
  });

  describe('.compile()', function() {
    it('should compile templates asynchronously', function(cb) {
      engine.compile('<%= name %>', function(err, fn) {
        if (err) return cb(err);
        assert.equal(typeof fn, 'function');
        assert(fn({name: '<%= name %>'}.equal), '<%= name %>');
        cb();
      });
    });
  });

  describe('.renderSync()', function() {
    it('should render templates synchronously', function() {
      var str = engine.renderSync('<%= name %>', {name: '<%= name %>'});
      assert.equal(str, '<%= name %>');
    });
  });

  describe('.render()', function() {
    it('should render templates asynchronously', function(cb) {
      var ctx = {name: '<%= name %>'};

      engine.render('<%= name %>', ctx, function(err, content) {
        if (err) return cb(err);
        assert.equal(content, '<%= name %>');
        cb();
      });
    });

    it('should handle errors', function(cb) {
      engine.render('<%= name %>', function(err, content) {
        if (err) return cb(err);
        assert.equal(err.message, 'name is not defined');
        cb();
      });
    });
  });

  describe('.renderFile()', function() {
    it('should render templates from a file', function(cb) {
      var ctx = {name: '<%= name %>'};

      engine.renderFile('test/fixtures/default.tmpl', ctx, function(err, content) {
        if (err) return cb(err);
        assert.equal(content, '<%= name %>');
        cb();
      });
    });

    it('should work when no context is passed', function(cb) {
      engine.renderFile('test/fixtures/nothing.tmpl', function(err, content) {
        if (err) return cb(err);
        assert.equal(content, 'empty');
        cb();
      });
    });

    it('should handle errors', function(cb) {
      engine.renderFile('test/fixtures/default.tmpl', function(err, content) {
        if (err) return cb(err);
        assert.equal(err.message, 'name is not defined');
        cb();
      });
    });
  });
});
