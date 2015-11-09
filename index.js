/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Kristof Jannes
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var PluginError = require('gulp-util').PluginError;
var through = require('through2');

var PLUGIN_NAME = 'gulp-html-rename';

var ABC = ['', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

/**
 * Get the next mapping depending on the current one, the alphabet and a
 * separator.
 * @param {Array<Number>} current The current mapping.
 * @param {Array<string>} alphabet The alphabet to choose from.
 * @param {string} separator The separator to inject inside the mapping.
 * @returns {string} The mapping.
 */
var getMapping = function(current, alphabet, separator) {
  current[4]++;
  if (current[4] >= alphabet.length) {
    current[3]++;
    current[4] = 0;
  }
  if (current[3] >= alphabet.length) {
    current[2]++;
    current[3] = 0;
  }
  if (current[2] >= alphabet.length) {
    current[1]++;
    current[2] = 0;
  }
  if (current[1] >= alphabet.length) {
    current[0]++;
    current[1] = 0;
  }

  return alphabet[current[0]] + separator + alphabet[current[1]] +
      alphabet[current[2]] + alphabet[current[3]] + alphabet[current[4]];
};

var currentId = [1, 0, 0, 0, 0];

var getIdMapping = function() {
  return getMapping(currentId, ABC, '');
};

var currentLongId = [1, 0, 0, 0, 0];

var getLongIdMapping = function() {
  return getMapping(currentLongId, ABC, '-');
};

var currentClass = [1, 0, 0, 0, 0];

var getClassMapping = function() {
  return getMapping(currentClass, ABC, '');
};

/**
 * Replace all occurrences of pattern inside the f at place i with the mapping
 * returned by mapper.
 * @param {string} f
 * @param {Number} i
 * @param {string} pattern
 * @param {function} mapper
 * @returns {string}
 */
function replace(f, i, pattern, mapper) {
  if (f.substr(i, pattern.length) === pattern) {
    var j = 1;
    while (f[i + j] != '\"' && f[i + j] != '\'' && f[i + j] != '>' &&
    f[i + j] != ' ' && f[i + j] != ')' && f[i + j] != '{') {
      j++;
    }

    f = f.replace(new RegExp(f.substr(i, j), 'g'), mapper())
  }

  return f;
}

/**
 * Rename all ids and classes to shorter names.
 * @param file The files to rename.
 * @returns {*}
 */
var rename = function(file) {
  var i = 0;

  if (file.isStream()) {
    this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));

  }

  if (file.isBuffer()) {
    var f = file.contents.toString('utf-8');

    while (i < f.length) {
      // Basic ids and classes.
      f = replace(f, i, 'id-', getIdMapping);
      f = replace(f, i, 'class-', getClassMapping);

      // Support for Polymer ids.
      f = replace(f, i, 'iron-', getLongIdMapping);
      f = replace(f, i, 'paper-', getLongIdMapping);
      f = replace(f, i, 'neon-', getLongIdMapping);
      f = replace(f, i, 'platinum-', getLongIdMapping);

      var j = 0;
      while (j < customPrefix.length) {
        f = replace(f, i, customPrefix[j].name, customPrefix[j].func);
        j++;
      }

      i++;
    }

    file.contents = new Buffer(f);
  }

  return file;
};

var customPrefix = [];

/**
 * @param options Array of objects with prefix and optional a type.
 * Prefix is the prefix of the words that should be shortened. Type is the type
 * of the word, either class, id or long-id.
 * class is used for css classes.
 * id is used for ids.
 * long-id is used for ids with a '-' inside it.
 */
module.exports = function(options) {
  if (options != null) {
    customPrefix = options;
    var func;
    for (var i = 0; i < options; i++) {
      switch (options[i].type) {
        case 'id':
          func = getIdMapping;
          break;
        case 'long-id':
          func = getLongIdMapping;
          break;
        case 'class':
          func = getClassMapping;
          break;
        default:
          func = getIdMapping;
      }

      customPrefix.push({
        prefix: options[i].prefix,
        func: func
      });
    }
  }

  return through.obj(function(file, encoding, callback) {
    callback(null, rename(file));
  });
};
