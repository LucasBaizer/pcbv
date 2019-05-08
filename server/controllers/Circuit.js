'use strict';

var utils = require('../utils/writer.js');
var Circuit = require('../service/CircuitService');

module.exports.circuitCircuitIdDELETE = function circuitCircuitIdDELETE (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  Circuit.circuitCircuitIdDELETE(circuitId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.createCircuit = function createCircuit (req, res, next) {
  Circuit.createCircuit()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.createCircuitCategory = function createCircuitCategory (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  Circuit.createCircuitCategory(circuitId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.createSubCircuit = function createSubCircuit (req, res, next) {
  var body = req.swagger.params['body'].value;
  var circuitId = req.swagger.params['circuitId'].value;
  Circuit.createSubCircuit(body,circuitId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteCircuitCategory = function deleteCircuitCategory (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  var categoryId = req.swagger.params['categoryId'].value;
  Circuit.deleteCircuitCategory(circuitId,categoryId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteCircuitComponent = function deleteCircuitComponent (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  var componentId = req.swagger.params['componentId'].value;
  Circuit.deleteCircuitComponent(circuitId,componentId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteSubCircuit = function deleteSubCircuit (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  var subCircuitId = req.swagger.params['subCircuitId'].value;
  Circuit.deleteSubCircuit(circuitId,subCircuitId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteSubCircuitComponent = function deleteSubCircuitComponent (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  var subCircuitId = req.swagger.params['subCircuitId'].value;
  var componentId = req.swagger.params['componentId'].value;
  Circuit.deleteSubCircuitComponent(circuitId,subCircuitId,componentId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getCircuit = function getCircuit (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  Circuit.getCircuit(circuitId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getCircuitCategories = function getCircuitCategories (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  Circuit.getCircuitCategories(circuitId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getCircuitComponents = function getCircuitComponents (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  Circuit.getCircuitComponents(circuitId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getSubCircuitComponents = function getSubCircuitComponents (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  var subCircuitId = req.swagger.params['subCircuitId'].value;
  Circuit.getSubCircuitComponents(circuitId,subCircuitId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getSubCircuits = function getSubCircuits (req, res, next) {
  var circuitId = req.swagger.params['circuitId'].value;
  Circuit.getSubCircuits(circuitId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
