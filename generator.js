'use strict';

var path = require('path');
var isValid = require('is-valid-app');
var extend = require('extend-shallow');

module.exports = function(app) {
  if (!isValid(app, 'generate-engine')) return;

  /**
   * Plugins
   */

  app.use(require('generate-project'));

  /**
   * Questions/helpers
   */

  app.question('engineName', 'Engine name?');
  app.question('moduleName', 'Name of the module to require?');
  app.helper('formatExt', function(ext) {
    return ext.charAt(0) === '.' ? ext : '.' + ext;
  });

  /**
   * Middleware
   */

  app.preWrite(/fixtures/, function(file, next) {
    var ext = app.data('engineExt');
    if (ext) file.extname = ext;
    next();
  });

  /**
   * Scaffold out the [necessary files](#default-1) for a [consolidate][]-style engine project.
   *
   * ```sh
   * $ gen engine
   * ```
   * @name default
   * @api public
   */

  app.task('engine', ['test', 'dotfiles', 'index', 'rootfiles', 'install']);
  app.task('default', ['engine']);

  /**
   * Scaffold out a [minimal](#minimal-1) engine project.
   *
   * ```sh
   * $ gen engine:min
   * # or
   * $ gen engine:minimal
   * ```
   * @name minimal
   * @api public
   */

  app.task('min', ['minimal']);
  app.task('minimal', ['gitignore', 'index', 'mit', 'package', 'readme']);

  /**
   * Write only the `index.js` file with starter code for creating a [consolidate][]-style
   * engine to the current working directory.
   *
   * ```sh
   * $ gen engine:index
   * ```
   * @name index
   * @api public
   */

  task(app, 'index', 'index.js');

  /**
   * Write only [test files](#test-1) with [mocha][]-style unit tests for your engine.
   *
   * ```sh
   * $ gen engine:test
   * ```
   * @name test
   * @api public
   */

  task(app, 'test', 'test.js', ['fixtures']);
  task(app, 'fixtures', 'fixtures/*.tmpl');
};

/**
 * Create a task with the given `name` and glob `pattern`
 */

function task(app, name, pattern, dependencies) {
  app.task(name, dependencies || [], function(cb) {
    return file(app, pattern);
  });
}

function file(app, pattern) {
  var opts = extend({}, app.base.options, app.options);
  var srcBase = opts.srcBase || path.join(__dirname, 'templates');
  return app.src(pattern, {cwd: srcBase})
    .pipe(app.renderFile('*', app.base.cache.data))
    .pipe(app.conflicts(app.cwd))
    .pipe(app.dest(function(file) {
      app.base.emit('dest', file);
      return app.cwd;
    }));
}
