'use strict'

const test = require('tape')

const isObj = (v) => {
	return 'object' === typeof v && v !== null && !Array.isArray(v)
}

const createFetchJourneys = (delay) => {
	const fetchJourneys = (from, to, opt) => {
		if ('string' !== typeof from || !from) {
			throw new Error('from must be a non-empty string.')
		}
		if ('string' !== typeof to || !to) {
			throw new Error('to must be a non-empty string.')
		}
		if (!isObj(opt)) throw new Error('opt must be an object.')

		const journeys = []
		for (let i = 0; i < (opt.results || 10); i++) {
			const leg = {
				origin: {
					type: 'station',
					id: from,
					name: from + ' station'
				},
				departure: {
					type: 'station',
					id: from,
					name: from + ' station'
				},
				line: {
					type: 'line',
					id: '123',
					name: '123 line'
				}
			}
			journeys.push({
				legs: [leg],
				origin: leg.origin,
				destination: leg.destination
			})
		}

		return new Promise((resolve) => {
			setTimeout(resolve, delay, journeys)
		})
	}
	return fetchJourneys
}

const setup = require('.')

test('callbacks work', (t) => {
	const fetchJourneys = createFetchJourneys(1000)
	const run = setup(fetchJourneys, [
		{from: '1', to: '2', opt: {results: 1}, when: t => t + 60 * 1000},
		{from: '1', to: '2', opt: {results: 1}, when: t => t + 120 * 1000}
	], {concurrency: 1})

	t.plan(7 * 4 + 4 + 2)

	const jobDone = (err, journeys, input) => {
		t.ifError(err)
		t.ok(Array.isArray(journeys))
		t.ok(journeys.length > 0)
		t.ok(isObj(input))
		t.equal(input.from, '1')
		t.equal(input.to, '2')
		// todo: input.opts
		t.equal(typeof input.started, 'number')
	}

	const firstRunJobDone = (err, journeys, input, iteration) => {
		jobDone(err, journeys, input)
		t.equal(iteration, 1)
	}
	const firstRunEnd = (iteration) => {
		t.equal(iteration, 1)
	}
	run(firstRunJobDone, firstRunEnd)

	const secondRunJobDone = (err, journeys, input, iteration) => {
		jobDone(err, journeys, input)
		t.equal(iteration, 2)
	}
	const secondRunEnd = (iteration) => {
		t.equal(iteration, 2)
	}
	run(secondRunJobDone, secondRunEnd)
})

test('fetchJourneys that rejects', (t) => {
	const fetchJourneys = () => Promise.reject(new Error('foo'))
	const run = setup(fetchJourneys, [
		{from: '1', to: '2', when: t => t}
	])

	t.plan(2 * 6)

	const jobDone = (err, journeys, input, iteration) => {
		t.ok(err)
		t.notOk(journeys)
		t.ok(isObj(input))
		t.equal(input.from, '1')
		t.equal(input.to, '2')
		t.equal(typeof iteration, 'number')
	}

	run(jobDone, () => {})
	run(jobDone, () => {})
})

// todo: fetchJourneys reject
