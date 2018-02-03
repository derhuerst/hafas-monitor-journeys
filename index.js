'use strict'

const createQueue = require('queue')

const setup = (fetchJourneys, tasks, onResult, opt = {}) => {
	if ('function' !== typeof fetchJourneys) {
		throw new Error('fetchJourneys must be a function.')
	}
	if (!Array.isArray(tasks)) {
		throw new Error('tasks must be an array.')
	}
	for (let t of tasks) {
		if ('object' !== typeof t || t === null || Array.isArray(t)) {
			throw new Error('every t must be an object')
		}
	}
	if ('function' !== typeof onResult) {
		throw new Error('onResult must be a function.')
	}
	if ('object' !== typeof opt || opt === null || Array.isArray(opt)) {
		throw new Error('opt must be an object')
	}

	const queue = createQueue({
		concurrency: opt.concurrency || 4,
		timeout: opt.timeout || 20 * 1000,
		autostart: true
	})

	const createFetch = (input) => {
		const fetch = (cb) => {
			const opts = Object.assign({}, input.opts)
			opts.when = new Date(input.when)

			input.started = Date.now()
			fetchJourneys(input.from, input.to, opts)
			.then((journeys) => {
				onResult(null, journeys, input)
				cb(null)
			})
			.catch((err) => {
				onResult(err, null, null)
				cb(err)
			})
		}
		return fetch
	}

	let iterations = 0
	const run = (onDone) => {
		if ('function' !== typeof onDone) {
			throw new Error('onDone must be a function.')
		}

		const iteration = iterations++
		const jobs = new WeakSet() // todo: ponyfill?
		let jobsLeft = 0

		for (let task of tasks) {
			const job = createFetch({
				iteration,
				from: task.from,
				to: task.to,
				when: task.when(Date.now()),
				opts: task.opts
			})
			queue.push(job)
			jobs.add(job)
			jobsLeft++
		}

		const onJobDone = (_, job) => {
			if (jobs.has(job)) {
				jobs.delete(job)
				if (--jobsLeft === 0) {
					queue.removeListener('success', onJobDone)
					queue.removeListener('error', onJobDone)
					queue.removeListener('timeout', onJobDone)
					setImmediate(onDone, iteration)
				}
			}
		}
		queue.on('success', onJobDone)
		queue.on('error', onJobDone)
		queue.on('timeout', onJobDone)
	}
	return run
}

module.exports = setup
