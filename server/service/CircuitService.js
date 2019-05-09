'use strict';

const uuid = require('uuid/v1');
const writer = require('../utils/writer');


/**
 * Creates basic information and the image for a new circuit
 *
 * body Circuit Data to create for the circuit
 * returns Circuit
 **/
exports.createCircuit = function (body) {
	return new Promise(async (resolve, reject) => {
		const id = body.circuitId || uuid();
		const count = (await database.sql.query('SELECT COUNT(*) AS Count FROM Circuits WHERE CircuitID=?', [id]))[0]['Count'];
		if(count > 0) {
			resolve(writer.respondWithCode(400, {
				error: 'Circuit already exists'
			}));
		} else {
			const imageBuffer = Buffer.from(body.image, 'base64');
			const attempt = await database.sql.query('INSERT INTO Circuits SET ?', {
				CircuitID: id,
				Name: body.name,
				Image: imageBuffer,
				ImageType: body.imageType
			}).catch(() => {
				resolve(writer.respondWithCode(400, {
					error: 'Unknown error caused by invalid payload'
				}));
			});
			if(attempt) {
				resolve({
					circuitId: id,
					name: body.name,
					image: body.name,
					imageType: body.imageType
				});
			}
		}
	});
}


/**
 * Creates a new circuit category
 *
 * circuitId String GUID of the circuit
 * body Category Data to create for the category (optional)
 * returns Category
 **/
exports.createCircuitCategory = function (circuitId, body) {
	return new Promise(async (resolve, reject) => {
		body.color = body.color.toUpperCase();
		if(!/^[0123456789ABCDEF]+$/g.test(body.color) || body.length !== 6) {
			resolve(writer.respondWithCode(400, {
				error: 'Invalid color'
			}));
		} else {
			const data = {
				CircuitID: circuitId,
				Name: body.name,
				RgbColor: body.color
			};
			if(body.categoryId) {
				data['CategoryID'] = body.categoryId;
			}
			const attempt = await database.sql.query('INSERT INTO Categories SET ?', data).catch(() => {
				resolve(writer.respondWithCode(400, {
					error: 'Unknown error caused by invalid payload'
				}));
			});
			if(attempt) {
				const id = await database.sql.query('SELECT LAST_INSERT_ID() AS ID')[0]['ID'];
				if(body.tags) {
					body.tags = body.tags.map(tag => ({
						CategoryID: id,
						TagContent: tag
					}));
					const attemptTags = await database.sql.query('INSERT INTO CategoryTags SET ?', body.tags).catch(() => {
						resolve(writer.respondWithCode(400, {
							error: 'Unknown error caused by invalid tags in payload'
						}));
					});
					if(attemptTags) {
						resolve({
							color: body.color,
							name: body.name,
							categoryId: id,
							circuitId: circuitId,
							tags: body.tags
						});
					}
				}
			}
		}
	});
}


/**
 * Creates basic information and image of a particular subcircuit in a circuit
 *
 * circuitId String GUID of the circuit
 * body SubCircuit Data to create for the subcircuit
 * returns SubCircuit
 **/
exports.createSubCircuit = function (circuitId, body) {
	return new Promise(function (resolve, reject) {
		var examples = {};
		examples['application/json'] = {
			"image": "image",
			"parentCircuitId": "parentCircuitId",
			"subCircuitId": 0
		};
		if (Object.keys(examples).length > 0) {
			resolve(examples[Object.keys(examples)[0]]);
		} else {
			resolve();
		}
	});
}


/**
 * Deletes a circuit
 *
 * circuitId String GUID of the circuit
 * no response value expected for this operation
 **/
exports.deleteCircuit = function (circuitId) {
	return new Promise(function (resolve, reject) {
		resolve();
	});
}


/**
 * Deletes a particular category of a circuit
 *
 * circuitId String GUID of the circuit
 * categoryId Integer ID of the category
 * no response value expected for this operation
 **/
exports.deleteCircuitCategory = function (circuitId, categoryId) {
	return new Promise(function (resolve, reject) {
		resolve();
	});
}


/**
 * Deletes a root component from the circuit
 *
 * circuitId String GUID of the circuit
 * componentId Integer ID of the component
 * no response value expected for this operation
 **/
exports.deleteCircuitComponent = function (circuitId, componentId) {
	return new Promise(function (resolve, reject) {
		resolve();
	});
}


/**
 * Deletes a particular subcircuit of a circuit
 *
 * circuitId String GUID of the circuit
 * subCircuitId Integer ID of the subcircuit
 * no response value expected for this operation
 **/
exports.deleteSubCircuit = function (circuitId, subCircuitId) {
	return new Promise(function (resolve, reject) {
		resolve();
	});
}


/**
 * Deletes a component from a particular subcircuit of a circuit
 *
 * circuitId String GUID of the circuit
 * subCircuitId Integer ID of the subcircuit
 * componentId Integer ID of the component
 * no response value expected for this operation
 **/
exports.deleteSubCircuitComponent = function (circuitId, subCircuitId, componentId) {
	return new Promise(function (resolve, reject) {
		resolve();
	});
}


/**
 * Gets basic information and the image of a circuit
 *
 * circuitId String GUID of the circuit
 * returns Circuit
 **/
exports.getCircuit = function (circuitId) {
	return new Promise(function (resolve, reject) {
		var examples = {};
		examples['application/json'] = {
			"image": "image",
			"name": "name",
			"circuitId": "circuitId"
		};
		if (Object.keys(examples).length > 0) {
			resolve(examples[Object.keys(examples)[0]]);
		} else {
			resolve();
		}
	});
}


/**
 * Gets categories of a circuit
 *
 * circuitId String GUID of the circuit
 * returns List
 **/
exports.getCircuitCategories = function (circuitId) {
	return new Promise(function (resolve, reject) {
		var examples = {};
		examples['application/json'] = [{
			"color": "color",
			"name": "name",
			"categoryId": 7,
			"circuitId": 9,
			"tags": ["tags", "tags"]
		}, {
			"color": "color",
			"name": "name",
			"categoryId": 7,
			"circuitId": 9,
			"tags": ["tags", "tags"]
		}];
		if (Object.keys(examples).length > 0) {
			resolve(examples[Object.keys(examples)[0]]);
		} else {
			resolve();
		}
	});
}


/**
 * Gets root components of a circuit
 *
 * circuitId String GUID of the circuit
 * returns List
 **/
exports.getCircuitComponents = function (circuitId) {
	return new Promise(function (resolve, reject) {
		var examples = {};
		examples['application/json'] = [{
			"documentationUrl": "documentationUrl",
			"componentId": 0,
			"bounds": {
				"x": 1,
				"width": 5,
				"y": 5,
				"height": 2
			},
			"name": "name",
			"subCircuitId": 6,
			"description": "description",
			"category": {
				"color": "color",
				"name": "name",
				"categoryId": 7,
				"circuitId": 9,
				"tags": ["tags", "tags"]
			}
		}, {
			"documentationUrl": "documentationUrl",
			"componentId": 0,
			"bounds": {
				"x": 1,
				"width": 5,
				"y": 5,
				"height": 2
			},
			"name": "name",
			"subCircuitId": 6,
			"description": "description",
			"category": {
				"color": "color",
				"name": "name",
				"categoryId": 7,
				"circuitId": 9,
				"tags": ["tags", "tags"]
			}
		}];
		if (Object.keys(examples).length > 0) {
			resolve(examples[Object.keys(examples)[0]]);
		} else {
			resolve();
		}
	});
}


/**
 * Gets components of a particular subcircuit of a circuit
 *
 * circuitId String GUID of the circuit
 * subCircuitId Integer ID of the subcircuit
 * returns List
 **/
exports.getSubCircuitComponents = function (circuitId, subCircuitId) {
	return new Promise(function (resolve, reject) {
		var examples = {};
		examples['application/json'] = [{
			"documentationUrl": "documentationUrl",
			"componentId": 0,
			"bounds": {
				"x": 1,
				"width": 5,
				"y": 5,
				"height": 2
			},
			"name": "name",
			"subCircuitId": 6,
			"description": "description",
			"category": {
				"color": "color",
				"name": "name",
				"categoryId": 7,
				"circuitId": 9,
				"tags": ["tags", "tags"]
			}
		}, {
			"documentationUrl": "documentationUrl",
			"componentId": 0,
			"bounds": {
				"x": 1,
				"width": 5,
				"y": 5,
				"height": 2
			},
			"name": "name",
			"subCircuitId": 6,
			"description": "description",
			"category": {
				"color": "color",
				"name": "name",
				"categoryId": 7,
				"circuitId": 9,
				"tags": ["tags", "tags"]
			}
		}];
		if (Object.keys(examples).length > 0) {
			resolve(examples[Object.keys(examples)[0]]);
		} else {
			resolve();
		}
	});
}


/**
 * Gets basic information and the image of all subcircuits of a circuit
 *
 * circuitId String GUID of the circuit
 * returns List
 **/
exports.getSubCircuits = function (circuitId) {
	return new Promise(function (resolve, reject) {
		var examples = {};
		examples['application/json'] = [{
			"image": "image",
			"parentCircuitId": "parentCircuitId",
			"subCircuitId": 0
		}, {
			"image": "image",
			"parentCircuitId": "parentCircuitId",
			"subCircuitId": 0
		}];
		if (Object.keys(examples).length > 0) {
			resolve(examples[Object.keys(examples)[0]]);
		} else {
			resolve();
		}
	});
}

