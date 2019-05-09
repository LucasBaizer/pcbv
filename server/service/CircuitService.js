'use strict';

const uuid = require('uuid/v1');
const writer = require('../utils/writer');
const util = require('./ServiceUtil');


/**
 * Creates basic information and the image for a new circuit
 *
 * body Circuit Data to create for the circuit
 * returns Circuit
 **/
exports.createCircuit = function (body) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const id = body.circuitId || uuid();
		const count = (await sql.query('SELECT COUNT(*) AS Count FROM Circuits WHERE CircuitID=?', [id]))[0]['Count'];
		if(count > 0) {
			resolve(writer.respondWithCode(400, {
				error: 'Circuit already exists'
			}));
		} else {
			const imageBuffer = Buffer.from(body.image, 'base64');
			const attempt = await sql.query('INSERT INTO Circuits SET ?', {
				CircuitID: id,
				Name: body.name
			}).catch(e => {
				resolve(writer.respondWithCode(400, {
					error: 'Unknown error caused by invalid payload'
				}));
			});
			if(attempt) {
				const subAttempt = await sql.query('INSERT INTO SubCircuits SET ?', {
					ParentCircuitID: id,
					Image: imageBuffer,
					ImageType: body.imageType,
					IsRoot: true
				}).catch(e => {
					resolve(writer.respondWithCode(400, {
						error: 'Unknown error caused by invalid payload'
					}));
				});
				if(subAttempt) {
					resolve({
						circuitId: id,
						name: body.name,
						image: body.name,
						imageType: body.imageType
					});
				}
			}
		}
		sql.end();
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
		const sql = await util.connect();

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
			const attempt = await sql.query('INSERT INTO Categories SET ?', data).catch(() => {
				resolve(writer.respondWithCode(400, {
					error: 'Unknown error caused by invalid payload'
				}));
			});
			if(attempt) {
				const id = await sql.query('SELECT LAST_INSERT_ID() AS ID')[0]['ID'];
				if(body.tags) {
					body.tags = body.tags.map(tag => ({
						CategoryID: id,
						TagContent: tag
					}));
					const attemptTags = await sql.query('INSERT INTO CategoryTags SET ?', body.tags).catch(() => {
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
		sql.end();
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
	return new Promise(async (resolve, reject) => {
		// var examples = {};
		// examples['application/json'] = {
		// 	"image": "image",
		// 	"parentCircuitId": "parentCircuitId",
		// 	"subCircuitId": 0
		// };
		// if (Object.keys(examples).length > 0) {
		// 	resolve(examples[Object.keys(examples)[0]]);
		// } else {
		// 	resolve();
		// }
		const sql = await util.connect();

		const buffer = Buffer.from(body.image, 'base64');
		const data = {
			Image: buffer,
			ImageType: body.imageType,
			ParentCircuitID: body.parentCircuitId,
			IsRoot: false
		};
		if(body.subCircuitId || typeof body.subCircuitId === 'number') {
			data['SubCircuitID'] = body.subCircuitId;
		}
		const attempt = sql.query('INSERT INTO SubCircuits SET ?', data).catch(() => {
			resolve(writer.respondWithCode(400, {
				error: 'Unknown error caused by invalid payload'
			}));
		});
		const id = (await sql.query('SELECT LAST_INSERT_ID() AS ID'))[0]['ID'];
		if(attempt) {
			resolve({
				...body,
				subCircuitId: id
			});
		}

		sql.end();
	});
}


/**
 * Deletes a circuit
 *
 * circuitId String GUID of the circuit
 * no response value expected for this operation
 **/
exports.deleteCircuit = function (circuitId) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const response = await sql.query('DELETE FROM Circuits WHERE CircuitID=?', [circuitId]);
		if(response.affectedRows === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			resolve();
		}
		sql.end();
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
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const response = await sql.query('DELETE FROM Categories WHERE CircuitID=? AND CategoryID=?', [circuitId, categoryId]);
		if(response.affectedRows === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			resolve();
		}
		sql.end();
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
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const query = `
			DELETE FROM Components
			INNER JOIN SubCircuits ON Components.SubCircuitID=SubCircuits.SubCircuitID
			INNER JOIN Circuits ON SubCircuits.ParentCircuitID=Circuits.CircuitID
			WHERE Circuits.CircutID=?
			AND SubCircuits.IsRoot=TRUE
			AND ComponentID=?
		`;
		const response = await sql.query(query, [circuitId, componentId]);
		if(response.affectedRows === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			resolve();
		}
		sql.end();
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
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const response = await sql.query('DELETE FROM SubCircuits WHERE ParentCircuitID=? AND SubCircuitID=?', [circuitId, subCircuitId]);
		if(response.affectedRows === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			resolve();
		}
		sql.end();
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
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const query = `
			DELETE FROM Components
			INNER JOIN SubCircuits ON Components.SubCircuitID=SubCircuits.SubCircuitID
			INNER JOIN Circuits ON SubCircuits.ParentCircuitID=Circuits.CircuitID
			WHERE Circuits.CircutID=?
			AND SubCircuits.SubCircuitID=?
			AND ComponentID=?
		`;
		const response = await sql.query(query, [circuitId, subCircuitId, componentId]);
		if(response.affectedRows === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			resolve();
		}
		sql.end();
	});
}


/**
 * Gets basic information and the image of a circuit
 *
 * circuitId String GUID of the circuit
 * returns Circuit
 **/
exports.getCircuit = function (circuitId) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const query = `
			SELECT Circuits.CircuitID, Circuits.Name, SubCircuits.Image, SubCircuits.ImageType FROM Circuits
			INNER JOIN SubCircuits ON Circuits.CircuitID=SubCircuits.ParentCircuitID
			WHERE Circuits.CircuitID=?
			AND SubCircuits.IsRoot=TRUE
		`;
		const circuits = await sql.query(query, [circuitId]);
		if(circuits.length === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			const circuit = circuits[0];
			resolve({
				circuitId: circuitId,
				name: circuit['Name'],
				image: circuit['Image'].toString('base64'),
				imageType: circuit['ImageType']
			});
		}
		sql.end();
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

