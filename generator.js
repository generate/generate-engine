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

  app.preWrite(/fixtures/, function(file, next) {
    var ext = app.data('engineExt');
    if (ext) file.extname = ext;
    next();
  });

  /**
   * Scaffold out a [consolidate][]-style engine project.
   *
   * ```sh
   * $ gen engine
   * ```
   * @name default
   * @api public
   */

  app.task('engine', ['test', 'editorconfig', 'minimal', 'index', 'install']);
  task(app, 'default', null, ['engine']);

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
   * Write a `test.js` file with [mocha][]-style unit tests for your engine.
   *
   * ```sh
   * $ gen engine:test
   * ```
   * @name test
   * @api public
   */

  task(app, 'test', 'test.js', ['fixtures']);
  task(app, 'fixtures', 'fixtures/*.tmpl');

  /**
   * Generate project trees
   */

  app.task('trees', function(cb) {
    app.enable('silent');
    app.build(['tree-default', 'tree-index', 'tree-test'], cb);
  });
};

/**
 * Create a task with the given `name` and glob `pattern`
 */

function task(app, name, pattern, dependencies) {
  app.task(`tree-${name}`, [name], createTree(app));
  app.task(name, dependencies || [], function(cb) {
    if (!pattern) return cb();
    return file(app, pattern);
  });
}

function file(app, pattern, options) {
  var opts = extend({}, app.options, options);
  var srcBase = opts.srcBase || path.join(__dirname, 'templates');
  return app.src(pattern, {cwd: srcBase})
    .pipe(app.renderFile('*', app.base.cache.data))
    .pipe(app.conflicts(app.cwd))
    .pipe(app.dest(app.cwd));
}

function createTree(app) {
  return function(cb) {
    var dest = app.options.trees || path.join(app.cwd, 'trees');
    var name = this.name.replace(/^tree-/, '');
    app.createTrees({name: name, dest: dest});
    app.log.time('creating tree for', app.log.green(name));
    cb();
  }
}
