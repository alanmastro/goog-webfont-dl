var Promise = require("bluebird");
var request = require("request");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var _ = require("lodash");

function createDirectory(options) {
  return new Promise(function (resolve, reject) {
    mkdirp(options.destination, function (err) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function downloadFont(destination, font) {
  return new Promise(function (resolve, reject) {
    if (font.name.search("-Regular") < 0) {
      if (font.name.search("-Bold") < 0) {
        if (font.name.search("-Italic") < 0) {
          if (font.name.search("-Bold-Italic") < 0) {
            var pieces = font.name.split(".");
            font.name = pieces[0] + "-Regular." + pieces[1];
          }
        }
      }
    }

    var out = fs.createWriteStream(path.join(destination, font.name));

    out.on("error", function (err) {
      reject(err);
    });

    out.on("finish", function () {
      resolve();
    });

    request(font.url).pipe(out);
  });
}

function downloadFonts(options, parsingResults) {
  return createDirectory(options).then(function () {
    function download(obj) {
      downloadFont(options.destination, obj);
    }

    return Promise.all(_.map(parsingResults.fontUrls, download));
  });
}

module.exports = downloadFonts;
module.exports.default = downloadFonts;
