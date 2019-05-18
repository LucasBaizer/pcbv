'use strict';

var utils = require('../utils/writer.js');
var Circuit = require('../service/CircuitService');

module.exports.createCircuit = function createCircuit(req, res, next) {
	var body = req.swagger.params['body'].value;
	Circuit.createCircuit(body)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.createCircuitCategory = function createCircuitCategory(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var body = req.swagger.params['body'].value;
	Circuit.createCircuitCategory(circuitId, body)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.createComponent = function createComponent(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var body = req.swagger.params['body'].value;
	var side = req.swagger.params['side'].value;
	Circuit.createComponent(circuitId, body, side)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.createSubCircuit = function createSubCircuit(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var body = req.swagger.params['body'].value;
	var side = req.swagger.params['side'].value;
	Circuit.createSubCircuit(circuitId, body, side)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.createSubCircuitComponent = function createSubCircuitComponent(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var subCircuitId = req.swagger.params['subCircuitId'].value;
	var body = req.swagger.params['body'].value;
	Circuit.createSubCircuitComponent(circuitId, subCircuitId, body)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.deleteCircuit = function deleteCircuit(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	Circuit.deleteCircuit(circuitId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.deleteCircuitCategory = function deleteCircuitCategory(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var categoryId = req.swagger.params['categoryId'].value;
	Circuit.deleteCircuitCategory(circuitId, categoryId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.deleteCircuitComponent = function deleteCircuitComponent(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var componentId = req.swagger.params['componentId'].value;
	Circuit.deleteCircuitComponent(circuitId, componentId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.deleteSubCircuit = function deleteSubCircuit(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var subCircuitId = req.swagger.params['subCircuitId'].value;
	Circuit.deleteSubCircuit(circuitId, subCircuitId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.deleteSubCircuitComponent = function deleteSubCircuitComponent(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var subCircuitId = req.swagger.params['subCircuitId'].value;
	var componentId = req.swagger.params['componentId'].value;
	Circuit.deleteSubCircuitComponent(circuitId, subCircuitId, componentId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.getCircuit = function getCircuit(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	Circuit.getCircuit(circuitId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.getCircuitCategories = function getCircuitCategories(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	Circuit.getCircuitCategories(circuitId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.getCircuitComponents = function getCircuitComponents(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var side = req.swagger.params['side'].value;
	Circuit.getCircuitComponents(circuitId, side)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.getSubCircuitComponents = function getSubCircuitComponents(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var subCircuitId = req.swagger.params['subCircuitId'].value;
	Circuit.getSubCircuitComponents(circuitId, subCircuitId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.getSubCircuit = function getSubCircuit(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var subCircuitId = req.swagger.params['subCircuitId'].value;
	Circuit.getSubCircuit(circuitId, subCircuitId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.getSubCircuits = function getSubCircuits(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var side = req.swagger.params['side'].value;
	Circuit.getSubCircuits(circuitId, side)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.updateCircuitComponent = function updateCircuitComponent(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var componentId = req.swagger.params['componentId'].value;
	var body = req.swagger.params['body'].value;
	Circuit.updateCircuitComponent(circuitId, componentId, body)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.updateSubCircuitComponent = function updateSubCircuitComponent(req, res, next) {
	var circuitId = req.swagger.params['circuitId'].value;
	var subCircuitId = req.swagger.params['subCircuitId'].value;
	var componentId = req.swagger.params['componentId'].value;
	var body = req.swagger.params['body'].value;
	Circuit.updateSubCircuitComponent(circuitId, subCircuitId, componentId, body)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};