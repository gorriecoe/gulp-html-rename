/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015-2016 Kristof Jannes
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

var getIdMapping = function() {
  return getMapping(htmlRename.cache['id'], ABC, '');
};

var getLongIdMapping = function() {
  return getMapping(htmlRename.cache['long-id'], ABC, '-');
};

var getClassMapping = function() {
  return getMapping(htmlRename.cache['class'], ABC, '');
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
    f[i + j] != ' ' && f[i + j] != ')' && f[i + j] != '{' && f[i + j] != ':') {
      j++;
    }

    var map = mapper();
    var regex = f.substr(i, j);

    htmlRename.map.push({'name': regex, 'map': map});

    f = f.replace(new RegExp(regex + '(?!-)', 'g'), map)
  }

  return f;
}

/**
 * Rename all ids and classes to shorter names.
 * @param file The files to rename.
 * @returns {*}
 */
var rename = function(file, allowedExtensions) {
  var allowedExtensions = allowedExtensions.join('|');
  var extensionRegex = new RegExp('.(html|css|js|' + allowedExtensions + ')', 'i');
  if (!String(file.history).match(extensionRegex)){
    return file;
  }

  var i = 0;

  if (file.isStream()) {
    this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
  }

  if (file.isBuffer()) {
    var f = file.contents.toString('utf-8');

    var k = 0;
    while (k < htmlRename.map.length) {
      f = f.replace(new RegExp(htmlRename.map[k].name + '(?!-)', 'g'),
          htmlRename.map[k].map);
      k++;
    }

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
        f = replace(f, i, customPrefix[j], getLongIdMapping);
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
 * @param options Array of prefixes.
 * Prefix is the prefix of the words that should be shortened.
 */
htmlRename = function(options, allowedExtensions) {
  if (options != null) {
    customPrefix = options;
  }

  return through.obj(function(file, encoding, callback) {
    callback(null, rename(file, allowedExtensions));
  });
};

htmlRename.cache = {
  'id': [1, 0, 0, 0, 0],
  'long-id': [1, 0, 0, 0, 0],
  'class': [1, 0, 0, 0, 0]
};

htmlRename.map = [];

module.exports = htmlRename;
