'use strict';

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

/**
 * Gets a PCBV random phrase
 * Gets a random phrase, which has an acronym of P.C.B.V. 
 *
 * returns PcbvPhrase
 **/
exports.getPcbvPhrase = function () {
	return new Promise(async (resolve, reject) => {
		const count = (await database.sql.query('SELECT COUNT(*) AS Count FROM PcbvPhrases'))[0]['Count'];
		const id = randomInt(1, count);
		const phrase = (await database.sql.query('SELECT Phrase FROM PcbvPhrases WHERE PhraseID=?', [id]))[0]['Phrase'];
		resolve({
			phrase: phrase
		});
	});
}

