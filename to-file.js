'use strict'

const fs = require('fs')

const noFormatting = j => j

const toFile = (dest, formatJourney = noFormatting) => {
	const sink = fs.createWriteStream(dest, {flags: 'a'}) // append
	const write = (data) => {
		sink.write(JSON.stringify(data) + '\n')
	}

	const onJobDone = (err, journeys, input, iteration) => {
		const report = {iteration, input}
		if (err) report.err = err.message || (err + '')
		else {
			for (let journey of journeys) {
				write(Object.assign({journey}, report))
			}
		}
	}
	return onJobDone
}

module.exports = toFile
