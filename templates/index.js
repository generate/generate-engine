'use strict';

var extend = require('extend-shallow');
var <%= camelcase(ask("engineName")) %> = require('<%= ask("moduleName") %>');

/**
 * <%= ask("engineName") %> support
 */

var engine = module.exports;

/**
 * Default engine options
 */

engine.options = {
  name: '<%= ask("engineName") %>',
  ext: '<%= formatExt(ask("engineExt", "File extension to associate with engine?")) %>',
};

/**
 * Compiled the given template `string` with `options` and callback.
 *
 * ```js
 * var engine = require('<%= name %>');
 * engine.compile('<%%= name %>', function (err, fn) {
 *   console.log(typeof fn)
 *   //=> 'function'
 * });
 * ```
 * @param  {String} `str` Template string to compile.
 * @param  {Object} `options` Options or settings to pass to <%= ask("engineName") %>
 * @param  {Function} `cb` Callback function
 * @return {Function}
 */

engine.compile = function(str, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  try {
    cb(null, engine.compileSync(str, options));
  } catch (err) {
    cb(err);
  }
};

/**
 * Compiled the given template `string` with `options`.
 *
 * ```js
 * var engine = require('<%= name %>');
 * var fn = engine.compile('<%%= name %>');
 * console.log(typeof fn)
 * //=> 'function'
 * ```
 * @param  {String} `str` Template string to compile.
 * @param  {Object} `options` Options or settings to pass to <%= ask("engineName") %>
 * @param  {Function} `cb` Callback function
 * @return {Function}
 */

engine.compileSync = function(str, options) {
  if (typeof str === 'function') {
    return str;
  }
  try {
    return <%= ask("engineName") %>(options);
  } catch (err) {
    throw err;
  }
};

/**
 * Asynchronous <%= ask("engineName") %> string support. Render the given `str` and invoke
 * the callback `cb(err, str)`.
 *
 * ```js
 * var engine = require('<%= name %>');
 * engine.render('<%%= name %>', {name: '<%= name %>'}, function (err, content) {
 *   console.log(content); //=> '<%= name %>'
 * });
 * ```
 * @param {String} `str`
 * @param {Object|Function} `options` or callback.
 * @param {Function} `callback`
 * @api public
 */

engine.render = function(str, locals, cb) {
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }
  try {
    cb(null, engine.renderSync(fn, locals));
  } catch (err) {
    cb(err);
  }
};

/**
 * Synchronous <%= ask("engineName") %> string support. Render the given `str` with `locals`.
 *
 * ```js
 * var engine = require('<%= name %>');
 * var str = engine.renderSync('<%%= name %>', {name: '<%= name %>'});
 * console.log(str); //=> '<%= name %>'
 * ```
 * @param {String} `str`
 * @param {Object} `locals`
 * @api public
 */

engine.renderSync = function(str, locals) {
  try {
    if (typeof str === 'function') {
      return str(locals);
    }
    var fn = engine.compile(str, locals);
    return fn(locals);
  } catch (err) {
    throw err;
  }
};

/**
 * Read a file at the given `filepath`, render the contents, and callback `cb(err, str)`.
 *
 * @param {String} `path`
 * @param {Object|Function} `options` or callback function.
 * @param {Function} `callback`
 * @api public
 */

engine.renderFile = function(filepath, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  try {
    var str = fs.readFileSync(filepath, 'utf8');
    cb(null, engine.render(str, options, cb));
  } catch (err) {
    cb(err);
  }
};

/**
 * Express support
 */

engine.__express = engine.renderFile;
