'use strict';

const util = require('./ServiceUtil');

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low + 1) + low);
}

/**
 * Gets a PCBV random phrase
 * Gets a random phrase, which has an acronym of P.C.B.V. 
 *
 * returns PcbvPhrase
 **/
exports.getPcbvPhrase = function () {
	return new Promise(async (resolve, reject) => {
		const sql = await util.connect();

		const count = (await sql.query('SELECT COUNT(*) AS Count FROM PcbvPhrases'))[0]['Count'];
		const id = randomInt(1, count);
		const phrase = (await sql.query('SELECT Phrase FROM PcbvPhrases WHERE PhraseID=?', [id]))[0]['Phrase'];
		resolve({
			phrase: phrase
		});

		sql.end();
	});
}

