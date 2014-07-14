/**
 * Render an index.js file in stdout from the given directory
 */

"use strict";

// Dependencies
var fs = require('fs');

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
      var path = dir + '/' + file;
      fs.stat(path, function(err, stat) {
        if (stat && stat.isDirectory()) {
          browse(path, function(err, res) {
            tree[file] = res;
            if (!--remaining) callback(null, tree);
          });
        } else {
          if(path.match(/.+\.js$/)) {
            var filenameWithoutExt = file.substring(0, file.lastIndexOf('.js'));
            tree[filenameWithoutExt] = getRequireString(path);
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

  // normalize
  if(path.lastIndexOf('/') === path.length-1) {
    path = path.substring(0, path.length-1);
  }

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



