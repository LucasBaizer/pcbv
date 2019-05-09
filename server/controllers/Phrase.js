'use strict';

var utils = require('../utils/writer.js');
var Phrase = require('../service/PhraseService');

module.exports.getPcbvPhrase = function getPcbvPhrase (req, res, next) {
  Phrase.getPcbvPhrase()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
