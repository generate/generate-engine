'use strict';

var path = require('path');
var trees = require('verb-trees');
var del = require('delete');
var generator = require('./');

module.exports = function(app) {
  app.use(require('verb-generate-readme'));
  app.use(trees(generator, ['default', 'index', 'minimal', 'test']));

  app.task('delete', function(cb) {
    del('.temp-trees', cb);
  });

  app.task('default', ['trees', 'readme', 'delete']);
};
