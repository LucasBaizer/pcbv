'use strict';

const uuid = require('uuid/v1');
const writer = require('../utils/writer');
const util = require('./ServiceUtil');

function consolidate(categorySql, idField) {
	const categories = [];
	let currentCategory = null;
	for (const category of categorySql) {
		if (currentCategory === null || currentCategory[idField] !== category[idField]) { // CategoryID
			if (currentCategory !== null) {
				categories.push(currentCategory);
				currentCategory = null;
			}
			currentCategory = {
				...category,
				TitleTagContent: [],
				DescriptionTagContent: [],
				DesignatorTagContent: []
			};
			if (category['TagContent']) {
				if (category['TagType'] === 0) {
					currentCategory['TitleTagContent'].push(category['TagContent']);
				} else if (category['TagType'] === 1) {
					currentCategory['DescriptionTagContent'].push(category['TagContent']);
				} else if (category['TagType'] === 2) {
					currentCategory['DesignatorTagContent'].push(category['TagContent']);
				}
			}
		} else {
			if (category['TagType'] === 0) {
				currentCategory['TitleTagContent'].push(category['TagContent']);
			} else if (category['TagType'] === 1) {
				currentCategory['DescriptionTagContent'].push(category['TagContent']);
			} else if (category['TagType'] === 2) {
				currentCategory['DesignatorTagContent'].push(category['TagContent']);
			}
		}
	}
	if (currentCategory !== null) {
		categories.push(currentCategory);
	}

	return categories;
}

function generateCategories(categorySql) {
	const categories = [];
	let currentCategory = null;
	for (const category of categorySql) {
		if (currentCategory === null || currentCategory.categoryId !== category['CategoryID']) {
			if (currentCategory !== null) {
				categories.push(currentCategory);
				currentCategory = null;
			}
			currentCategory = {
				color: category['RgbColor'],
				name: category['Name'],
				categoryId: category['CategoryID'],
				circuitId: category['CircuitID'],
				titleTags: [],
				descriptionTags: [],
				designatorTags: []
			};
			if (category['TagContent']) {
				if (category['TagType'] === 0) {
					currentCategory.titleTags.push(category['TagContent']);
				} else if (category['TagType'] === 1) {
					currentCategory.descriptionTags.push(category['TagContent']);
				} else if (category['TagType'] === 2) {
					currentCategory.designatorTags.push(category['TagContent']);
				}
			}
		} else {
			if (category['TagType'] === 0) {
				currentCategory.titleTags.push(category['TagContent']);
			} else if (category['TagType'] === 1) {
				currentCategory.descriptionTags.push(category['TagContent']);
			} else if (category['TagType'] === 2) {
				currentCategory.designatorTags.push(category['TagContent']);
			}
		}
	}
	if (currentCategory !== null) {
		categories.push(currentCategory);
	}

	return categories;
}


/**
 * Creates basic information and the image for a new circuit
 *
 * body Circuit Data to create for the circuit
 * returns Circuit
 **/
exports.createCircuit = function (body) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		let sqlSuccess = false;
		await sql.beginTransaction();

		const id = body.circuitId || uuid();
		const count = (await sql.query('SELECT COUNT(*) AS Count FROM Circuits WHERE CircuitID=?', [id]))[0]['Count'];
		if (count > 0) {
			resolve(writer.respondWithCode(400, {
				error: 'Circuit already exists'
			}));
		} else {
			const frontImageBuffer = Buffer.from(body.imageFront, 'base64');
			const backImageBuffer = Buffer.from(body.imageBack, 'base64');
			const attempt = await sql.query('INSERT INTO Circuits SET ?', {
				CircuitID: id,
				Name: body.name
			}).catch(e => {
				resolve(writer.respondWithCode(400, {
					error: 'Unknown error caused by invalid payload'
				}));
			});
			if (attempt) {
				const subAttempt = await sql.query('INSERT INTO SubCircuits (ParentCircuitID, Image, ImageType, IsRoot, IsFront) VALUES ?', [[
					[
						id,
						frontImageBuffer,
						body.imageType,
						true,
						true
					],
					[
						id,
						backImageBuffer,
						body.imageType,
						true,
						false
					]
				]]).catch(e => {
					console.log(e);
					resolve(writer.respondWithCode(400, {
						error: 'Unknown error caused by invalid payload'
					}));
				});
				if (subAttempt) {
					const defaultCategories = [
						[id, 'None', 'C8C8C8C0'],
						[id, 'Memory', 'FF00FFC0'],
						[id, 'CPU', 'FFFFFFC0'],
						[id, 'Flash', 'FF0000C0'],
						[id, 'Resistor', '00FF00C0'],
						[id, 'Capacitor', '0000FFC0'],
						[id, 'Power Conversion', 'FFFF00C0'],
						[id, 'Communication', '00FFFFC0'],
						[id, 'Other IC', 'EEAAEEC0']
					];
					const response = await sql.query('INSERT INTO Categories (CircuitID, Name, RgbColor) VALUES ?', [defaultCategories]);

					const firstId = response.insertId;
					const defaultTags = [
						[firstId + 4, '^R[0-9]+$', 2], // resistor
						[firstId + 5, '^C[0-9]+$', 2], // capacitor
						[firstId + 6, '^[IL][0-9]+$', 2], // power conversion
						[firstId + 8, '^[DUQ][0-9]+$', 2] // other IC
					];
					await sql.query('INSERT INTO CategoryTags (CategoryID, TagContent, TagType) VALUES ?', [defaultTags]);

					await sql.commit();

					sqlSuccess = true;

					resolve({
						circuitId: id,
						name: body.name,
						imageFront: body.imageFront,
						imageBack: body.imageBack,
						imageType: body.imageType
					});
				}
			}
		}
		if (!sqlSuccess) {
			await sql.rollback();
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
		if (!/^[0123456789ABCDEF]+$/g.test(body.color) || body.color.length !== 8) {
			resolve(writer.respondWithCode(400, {
				error: 'Invalid color'
			}));
		} else {
			const data = {
				CircuitID: circuitId,
				Name: body.name,
				RgbColor: body.color
			};
			if (body.categoryId) {
				data['CategoryID'] = body.categoryId;
			}
			const attempt = await sql.query('INSERT INTO Categories SET ?', data).catch(() => {
				resolve(writer.respondWithCode(400, {
					error: 'Unknown error caused by invalid payload'
				}));
			});
			if (attempt) {
				const id = attempt.insertId;
				if ((body.titleTags && body.titleTags.length > 0) || (body.descriptionTags && body.descriptionTags.length > 0) || (body.designatorTags && body.designatorTags.length > 0)) {
					// const insertTags = body.titleTags.map(tag => [id, tag]);
					let insertTags = [];
					if (body.titleTags) {
						insertTags = insertTags.concat(body.titleTags.map(tag => [id, tag, 0]));
					}
					if (body.descriptionTags) {
						insertTags = insertTags.concat(body.descriptionTags.map(tag => [id, tag, 1]));
					}
					if (body.designatorTags) {
						insertTags = insertTags.concat(body.designatorTags.map(tag => [id, tag, 2]));
					}
					const attemptTags = await sql.query('INSERT INTO CategoryTags (CategoryID, TagContent, TagType) VALUES ?', [insertTags]).catch(() => {
						resolve(writer.respondWithCode(400, {
							error: 'Unknown error caused by invalid tags in payload'
						}));
					});
					if (attemptTags) {
						resolve({
							color: body.color,
							name: body.name,
							categoryId: id,
							circuitId: circuitId,
							titleTags: body.titleTags || [],
							descriptionTags: body.descriptionTags || [],
							designatorTags: body.designatorTags | []
						});
					}
				} else {
					resolve({
						color: body.color,
						name: body.name,
						categoryId: id,
						circuitId: circuitId,
						titleTags: [],
						descriptionTags: [],
						designatorTags: []
					});
				}
			}
		}
		sql.end();
	});
}

/**
 * Create a new root component for a circuit
 *
 * circuitId String GUID of the circuit
 * body Component Data to create for the component (optional)
 * returns Component
 **/
exports.createComponent = function (circuitId, body, side) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		let sqlSuccess = false;
		await sql.beginTransaction();

		if (!body.categoryId && body.categoryId !== 0) {
			resolve(writer.respondWithCode(400, {
				error: 'Invalid category ID (missing field: categoryId)'
			}));
		} else {
			const mainSub = (await sql.query('SELECT SubCircuitID FROM SubCircuits WHERE ParentCircuitID=? AND IsRoot=TRUE AND IsFront=?', [circuitId, side === 'front']))[0]['SubCircuitID'];

			const data = {
				RectX: body.bounds.x,
				RectY: body.bounds.y,
				RectWidth: body.bounds.width,
				RectHeight: body.bounds.height,
				DocumentationUrl: body.documentationUrl,
				Description: body.description,
				Designator: body.designator,
				Name: body.name,
				CategoryID: body.categoryId,
				SubCircuitID: mainSub
			};
			if (body.componentId || typeof body.componentId === 'number') {
				data['ComponentID'] = body.componentId;
			}
			const success = await sql.query('INSERT INTO Components SET ?', data).catch(() => {
				resolve(writer.respondWithCode(400, {
					error: 'Unknown error caused by invalid payload'
				}));
			});
			if (success) {
				const query = `
					SELECT Circuits.CircuitID, Categories.Name, Categories.RgbColor, Categories.CategoryID, CategoryTags.TagContent, CategoryTags.TagType
					FROM Circuits
					INNER JOIN Categories ON Circuits.CircuitID=Categories.CircuitID
					LEFT JOIN CategoryTags ON Categories.CategoryID=CategoryTags.CategoryID
					WHERE Circuits.CircuitID=?
					AND Categories.CategoryID=?
				`;
				const categorySql = await sql.query(query, [circuitId, body.categoryId]);
				const categories = generateCategories(categorySql);

				const newBody = {
					...body,
					category: categories[0],
					componentId: success.insertId,
					subCircuitId: mainSub,
					circuitId: circuitId
				};
				delete newBody.categoryId;

				await sql.commit();
				sqlSuccess = true;

				resolve(newBody);
			}
		}

		if (!sqlSuccess) {
			await sql.rollback();
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
exports.createSubCircuit = function (circuitId, body, side) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		await sql.beginTransaction();
		let sqlSuccess = false;

		const buffer = Buffer.from(body.image, 'base64');
		const data = {
			Image: buffer,
			ImageType: body.imageType,
			ParentCircuitID: circuitId,
			IsFront: side === 'front',
			IsRoot: false,
			RectX: body.bounds.x,
			RectY: body.bounds.y,
			RectWidth: body.bounds.width,
			RectHeight: body.bounds.height
		};
		if (body.subCircuitId || typeof body.subCircuitId === 'number') {
			data['SubCircuitID'] = body.subCircuitId;
		}
		const attempt = await sql.query('INSERT INTO SubCircuits SET ?', data).catch(() => {
			resolve(writer.respondWithCode(400, {
				error: 'Unknown error caused by invalid payload'
			}));
		});
		const id = attempt.insertId;
		if (attempt) {
			await sql.commit();
			sqlSuccess = true;

			resolve({
				...body,
				subCircuitId: id
			});
		}

		if (!sqlSuccess) {
			await sql.rollback();
		}
		sql.end();
	});
}

/**
 * Creates a component for a particular subcircuit of a circuit
 *
 * circuitId String GUID of the circuit
 * subCircuitId Integer ID of the subcircuit
 * body Component Data to create for the component
 * returns Component
 **/
exports.createSubCircuitComponent = function (circuitId, subCircuitId, body) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		let sqlSuccess = false;
		await sql.beginTransaction();

		if (!body.categoryId && body.categoryId !== 0) {
			resolve(writer.respondWithCode(400, {
				error: 'Invalid category ID (missing field: categoryId)'
			}));
		} else {
			const data = {
				RectX: body.bounds.x,
				RectY: body.bounds.y,
				RectWidth: body.bounds.width,
				RectHeight: body.bounds.height,
				DocumentationUrl: body.documentationUrl,
				Description: body.description,
				Designator: body.designator,
				Name: body.name,
				CategoryID: body.categoryId,
				SubCircuitID: subCircuitId
			};
			if (body.componentId || typeof body.componentId === 'number') {
				data['ComponentID'] = body.componentId;
			}
			const success = await sql.query('INSERT INTO Components SET ?', data).catch(() => {
				resolve(writer.respondWithCode(400, {
					error: 'Unknown error caused by invalid payload'
				}));
			});
			if (success) {
				const query = `
					SELECT Circuits.CircuitID, Categories.Name, Categories.RgbColor, Categories.CategoryID, CategoryTags.TagContent, CategoryTags.TagType
					FROM Circuits
					INNER JOIN Categories ON Circuits.CircuitID=Categories.CircuitID
					LEFT JOIN CategoryTags ON Categories.CategoryID=CategoryTags.CategoryID
					WHERE Circuits.CircuitID=?
					AND Categories.CategoryID=?
				`;
				const categorySql = await sql.query(query, [circuitId, body.categoryId]);
				const categories = generateCategories(categorySql);

				const newBody = {
					...body,
					category: categories[0],
					componentId: success.insertId,
					subCircuitId: mainSub,
					circuitId: circuitId
				};
				delete newBody.categoryId;

				await sql.commit();
				sqlSuccess = true;

				resolve(newBody);
			}
		}

		if (!sqlSuccess) {
			await sql.rollback();
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
		if (response.affectedRows === 0) {
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
		if (response.affectedRows === 0) {
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
			DELETE Components
			FROM Components
			INNER JOIN SubCircuits ON Components.SubCircuitID=SubCircuits.SubCircuitID
			INNER JOIN Circuits ON SubCircuits.ParentCircuitID=Circuits.CircuitID
			WHERE Circuits.CircuitID=?
			AND SubCircuits.IsRoot=TRUE
			AND ComponentID=?
		`;
		const response = await sql.query(query, [circuitId, componentId]);
		if (response.affectedRows === 0) {
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
		if (response.affectedRows === 0) {
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
			WHERE Circuits.CircuitID=?
			AND SubCircuits.SubCircuitID=?
			AND ComponentID=?
		`;
		const response = await sql.query(query, [circuitId, subCircuitId, componentId]);
		if (response.affectedRows === 0) {
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
		if (circuits.length === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			const frontCircuit = circuits[0];
			const backCircuit = circuits[1];
			resolve({
				circuitId: circuitId,
				name: frontCircuit['Name'],
				imageFront: frontCircuit['Image'].toString('base64'),
				imageBack: backCircuit['Image'].toString('base64'),
				imageType: frontCircuit['ImageType']
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
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();

		const query = `
			SELECT Circuits.CircuitID, Categories.Name, Categories.RgbColor, Categories.CategoryID, CategoryTags.TagContent, CategoryTags.TagType
			FROM Circuits
			INNER JOIN Categories ON Circuits.CircuitID=Categories.CircuitID
			LEFT JOIN CategoryTags ON Categories.CategoryID=CategoryTags.CategoryID
			WHERE Circuits.CircuitID=?
			ORDER BY (Categories.CategoryID)
		`;
		const categoriesSql = await sql.query(query, [circuitId]);
		if (categoriesSql.length === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			const categories = generateCategories(categoriesSql);
			resolve(categories);
		}

		sql.end();
	});
}


/**
 * Gets root components of a circuit
 *
 * circuitId String GUID of the circuit
 * returns List
 **/
exports.getCircuitComponents = function (circuitId, side) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const circuits = await sql.query('SELECT COUNT(*) as Count FROM Circuits WHERE CircuitID=?', [circuitId]);
		if (circuits[0]['Count'] === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			const sql = await util.connect();
			const query = `
				SELECT DocumentationUrl, Components.ComponentID, Components.RectX, Components.RectY, Components.RectWidth, Components.RectHeight, Components.RectWidth, Components.RectHeight, Components.Name as ComponentName, Components.Designator, Components.SubCircuitID, Circuits.CircuitID, Description, Categories.Name as CategoryName, Categories.RgbColor, Categories.CategoryID, CategoryTags.TagContent, CategoryTags.TagType
				FROM Components
				INNER JOIN SubCircuits ON Components.SubCircuitID=SubCircuits.SubCircuitID
				INNER JOIN Circuits ON SubCircuits.ParentCircuitID=Circuits.CircuitID
				INNER JOIN Categories ON Components.CategoryID=Categories.CategoryID AND Circuits.CircuitID=Categories.CircuitID
				LEFT JOIN CategoryTags ON Categories.CategoryID=CategoryTags.CategoryID
				WHERE Circuits.CircuitID=?
				AND SubCircuits.IsRoot=TRUE
				AND SubCircuits.IsFront=?
				ORDER BY Components.ComponentID, Categories.CategoryID
			`;
			const response = await sql.query(query, [circuitId, side === 'front']);
			if (response.length === 0) {
				resolve([]);
			} else {
				const consolidated = consolidate(response, 'ComponentID');
				resolve(consolidated.map(item => {
					return {
						documentationUrl: item['DocumentationUrl'],
						componentId: item['ComponentID'],
						bounds: {
							x: item['RectX'],
							y: item['RectY'],
							width: item['RectWidth'],
							height: item['RectHeight']
						},
						name: item['ComponentName'],
						designator: item['Designator'],
						subCircuitId: item['SubCircuitID'],
						circuitId: item['CircuitID'],
						description: item['Description'],
						category: {
							color: item['RgbColor'],
							name: item['CategoryName'],
							categoryId: item['CategoryID'],
							circuitId: item['CircuitID'],
							titleTags: item['TitleTagContent'],
							descriptionTags: item['DescriptionTagContent'],
							designatorTags: item['DesignatorTagContent']
						}
					};
				}));
			}
		}
		sql.end();
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
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();

		const circuits = await sql.query('SELECT COUNT(*) as Count FROM SubCircuits WHERE ParentCircuitID=? AND SubCircuitID=?', [circuitId, subCircuitId]);
		if (circuits[0]['Count'] === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			const query = `
				SELECT DocumentationUrl, Components.ComponentID, RectX, RectY, RectWidth, RectHeight, Components.Name as ComponentName, Designator, Components.SubCircuitID, Circuits.CircuitID, Description, Categories.Name as CategoryName, Categories.RgbColor, Categories.CategoryID, CategoryTags.TagContent, CategoryTags.TagType
				FROM Components
				INNER JOIN SubCircuits ON Components.SubCircuitID=SubCircuits.SubCircuitID
				INNER JOIN Circuits ON SubCircuits.ParentCircuitID=Circuits.CircuitID
				INNER JOIN Categories ON Components.CategoryID=Categories.CategoryID AND Circuits.CircuitID=Categories.CircuitID
				LEFT JOIN CategoryTags ON Categories.CategoryID=CategoryTags.CategoryID
				WHERE Circuits.CircuitID=?
				AND SubCircuits.SubCircuitID=?
				ORDER BY Components.ComponentID, Categories.CategoryID
			`;
			const response = await sql.query(query, [circuitId, subCircuitId]);
			if (response.length === 0) {
				resolve([]);
			} else {
				const consolidated = consolidate(response, 'ComponentID');
				resolve(consolidated.map(item => {
					return {
						documentationUrl: item['DocumentationUrl'],
						componentId: item['ComponentID'],
						bounds: {
							x: item['RectX'],
							y: item['RectY'],
							width: item['Width'],
							height: item['Height']
						},
						name: item['ComponentName'],
						designator: item['Designator'],
						subCircuitId: item['SubCircuitID'],
						circuitId: item['CircuitID'],
						description: item['Description'],
						category: {
							color: item['RgbColor'],
							name: item['CategoryName'],
							categoryId: item['CategoryID'],
							circuitId: item['CircuitID'],
							titleTags: item['TitleTagContent'],
							descriptionTags: item['DescriptionTagContent'],
							designatorTags: item['DesignatorTagContent']
						}
					};
				}));
			}
		}
		sql.end();
	});
}

exports.getSubCircuit = function (circuitId, subCircuitId) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const circuits = await sql.query('SELECT COUNT(*) as Count FROM Circuits WHERE CircuitID=?', [circuitId]);
		if (circuits[0]['Count'] === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			const subCircuits = await sql.query('SELECT Image, ImageType, RectX, RectY, RectWidth, RectHeight, ParentCircuitID, SubCircuitID FROM SubCircuits WHERE ParentCircuitID=? AND SubCircuitID=?', [circuitId, subCircuitId]);
			if (subCircuits.length === 0) {
				resolve(writer.respondWithCode(404));
			} else {
				resolve(subCircuits.map(circuit => ({
					image: circuit['Image'],
					imageType: circuit['ImageType'],
					parentCircuitId: circuit['ParentCircuitID'],
					subCircuitId: circuit['SubCircuitID'],
					bounds: {
						x: circuit['RectX'],
						y: circuit['RectY'],
						width: circuit['RectWidth'],
						height: circuit['RectHeight']
					}
				})));
			}
		}
		sql.end();
	});
}


/**
 * Gets basic information and the image of all subcircuits of a circuit
 *
 * circuitId String GUID of the circuit
 * returns List
 **/
exports.getSubCircuits = function (circuitId, side) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const circuits = await sql.query('SELECT COUNT(*) as Count FROM Circuits WHERE CircuitID=?', [circuitId]);
		if (circuits[0]['Count'] === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			const subCircuits = await sql.query('SELECT RectX, RectY, RectWidth, RectHeight, ParentCircuitID, SubCircuitID FROM SubCircuits WHERE ParentCircuitID=? AND IsFront=? AND IsRoot=FALSE', [circuitId, side === 'front']);
			if (subCircuits.length === 0) {
				resolve([]);
			} else {
				resolve(subCircuits.map(circuit => ({
					parentCircuitId: circuit['ParentCircuitID'],
					subCircuitId: circuit['SubCircuitID'],
					bounds: {
						x: circuit['RectX'],
						y: circuit['RectY'],
						width: circuit['RectWidth'],
						height: circuit['RectHeight']
					}
				})));
			}
		}
		sql.end();
	});
}

/**
 * Updates data of particular category of a circuit
 *
 * circuitId String GUID of the circuit
 * categoryId Integer ID of the category
 * body Category Data to update for the category
 * returns Category
 **/
exports.updateCircuitCategory = function (circuitId, categoryId, body) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const query = `
			UPDATE Categories SET ?
			WHERE CircuitID=?
			AND CategoryID=?
		`;
		const data = {};
		if (body.name !== undefined) {
			data['Name'] = body.name;
		}
		if (body.color !== undefined) {
			data['RgbColor'] = body.color;
		}
		const response = await sql.query(query, [data, circuitId, categoryId]);
		if (response.affectedRows === 0 && !body.titleTags && !body.descriptionTags && !body.designatorTags) {
			resolve(writer.respondWithCode(404));
		} else {
			if (body.titleTags !== undefined && body.titleTags.length > 0) {
				await sql.query('DELETE FROM CategoryTags WHERE CategoryID=? AND TagType=0', categoryId);
				await sql.query('INSERT INTO CategoryTags (CategoryID, TagContent, TagType) VALUES ?', [body.titleTags.map(tag => [categoryId, tag, 0])]);
			}
			if (body.descriptionTags !== undefined && body.descriptionTags.length > 0) {
				await sql.query('DELETE FROM CategoryTags WHERE CategoryID=? AND TagType=1', categoryId);
				await sql.query('INSERT INTO CategoryTags (CategoryID, TagContent, TagType) VALUES ?', [body.descriptionTags.map(tag => [categoryId, tag, 1])]);
			}
			if (body.designatorTags !== undefined && body.designatorTags.length > 0) {
				await sql.query('DELETE FROM CategoryTags WHERE CategoryID=? AND TagType=2', categoryId);
				await sql.query('INSERT INTO CategoryTags (CategoryID, TagContent, TagType) VALUES ?', [body.designatorTags.map(tag => [categoryId, tag, 2])]);
			}

			resolve(body);
		}
		sql.end();
	});
}

exports.updateCircuitComponent = function (circuitId, componentId, body) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const query = `
			UPDATE Components
			INNER JOIN SubCircuits ON Components.SubCircuitID=SubCircuits.SubCircuitID
			INNER JOIN Circuits ON SubCircuits.ParentCircuitID=Circuits.CircuitID
			SET ?
			WHERE CircuitID=?
			AND ComponentID=?
			AND SubCircuits.IsRoot=TRUE
		`;
		const data = {};
		if (body.documentationUrl !== undefined) {
			data['DocumentationUrl'] = body.documentationUrl;
		}
		if (body.description !== undefined) {
			data['Description'] = body.description;
		}
		if (body.name !== undefined) {
			data['Components.Name'] = body.name;
		}
		if (body.categoryId !== undefined) {
			data['CategoryID'] = body.categoryId;
		}
		if (body.bounds !== undefined) {
			data['Components.RectX'] = body.bounds.x;
			data['Components.RectY'] = body.bounds.y;
			data['Components.RectWidth'] = body.bounds.width;
			data['Components.RectHeight'] = body.bounds.height;
		}
		if(body.designator !== undefined) {
			data['Designator'] = body.designator;
		}
		const response = await sql.query(query, [data, circuitId, componentId]);
		if (response.affectedRows === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			resolve(body);
		}
		sql.end();
	});
}


/**
 * Updates the data for a particular component of a particular subcircuit of a circuit
 *
 * circuitId String GUID of the circuit
 * subCircuitId Integer ID of the subcircuit
 * componentId Integer ID of the component
 * body Component Data to update for the component (optional)
 * returns Component
 **/
exports.updateSubCircuitComponent = function (circuitId, subCircuitId, componentId, body) {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();
		const query = `
			UPDATE Components
			INNER JOIN SubCircuits ON Components.SubCircuitID=SubCircuits.SubCircuitID
			INNER JOIN Circuits ON SubCircuits.ParentCircuitID=Circuits.CircuitID
			SET ?
			WHERE CircuitID=?
			AND ComponentID=?
			AND SubCircuits.SubCircuitID=?
		`;
		const data = {};
		if (body.documentationUrl !== undefined) {
			data['DocumentationUrl'] = body.documentationUrl;
		}
		if (body.description !== undefined) {
			data['Description'] = body.description;
		}
		if (body.name !== undefined) {
			data['Components.Name'] = body.name;
		}
		if (body.categoryId !== undefined) {
			data['CategoryID'] = body.categoryId;
		}
		if (body.bounds !== undefined) {
			data['Components.RectX'] = body.bounds.x;
			data['Components.RectY'] = body.bounds.y;
			data['Components.RectWidth'] = body.bounds.width;
			data['Components.RectHeight'] = body.bounds.height;
		}
		if(body.designator !== undefined) {
			data['Designator'] = body.designator;
		}
		const response = await sql.query(query, [data, circuitId, componentId, subCircuitId]);
		if (response.affectedRows === 0) {
			resolve(writer.respondWithCode(404));
		} else {
			resolve(body);
		}
		sql.end();
	});
}