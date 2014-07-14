/**
 * Render an index.js file in stdout from the given directory
 */

"use strict";

// Dependencies
var fs = require('fs');

/**
 * return the last part of a given path
 * @param {String} path
 * 
 * @return {String} Top part of the path
 */
var getTop = function(path) {
  var indexSep = path.lastIndexOf('/');
  var top = path.substring(indexSep + 1);
  return top;
};

/** 
 * create the require string to put in index.js
 * @param {String} path Entire path of the file
 *
 * @return {String} Require String
 */
var getRequireString = function(path) {
  return "require('" + path + "')";
};

/**
 * Main indexing recursive function
 * @param {String} dir Directory to index
 * @param {Function} callback Function to call when current dir indexing finished
 */
var browse = function(dir, callback) {
  var tree = {};

  fs.readdir(dir, function(err, list) {
    if (err) return callback(err);
    
    var remaining = list.length;
    if (!remaining) return callback(null, tree);
    
    list.forEach(function(file) {
      file = dir + '/' + file;

      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          browse(file, function(err, res) {
            tree[getTop(file)] = res;
            if (!--remaining) callback(null, tree);
          });
        } else {
          if(file.match(/.+\.js/g)) {
            var filename = getTop(file);
            var filenameWithoutExt = filename.substring(0, filename.lastIndexOf('.js'));
            tree[filenameWithoutExt] = getRequireString(file);
          }
          if (!--remaining) callback(null, tree);
        }
      });
    });
  });
};

// Run it
var index = function() {
  var path = process.argv[2];
  browse(path, function(err, res) {
  
    // sandwich
    var output = 'module.exports = ';
    output += JSON.stringify(res, null, '\t');
    output += ';';

    // remove quotes
    output = output.replace(/\"/g, "");

    console.log(output); 
  });
}

exports.index = index;



