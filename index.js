'use strict'

const createQueue = require('queue')

const setup = (fetchJourneys, tasks, opt = {}) => {
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
			opts.departure = new Date(input.when)

			input.started = Date.now()
			fetchJourneys(input.from, input.to, opts)
			.then((journeys) => cb(null, journeys))
			.catch(cb)
		}
		return fetch
	}

	let iterations = 0
	const run = (onJobDone, onEnd) => {
		if ('function' !== typeof onJobDone) {
			throw new Error('onJobDone must be a function.')
		}
		if ('function' !== typeof onEnd) {
			throw new Error('onEnd must be a function.')
		}

		const iteration = ++iterations
		const jobs = new WeakSet() // todo: ponyfill?
		let jobsLeft = 0

		for (let task of tasks) {
			const input = {
				iteration,
				from: task.from,
				to: task.to,
				when: task.when(Date.now()),
				opts: task.opts
			}
			const job = createFetch(input)
			job.input = input

			queue.push(job)
			jobs.add(job)
			jobsLeft++
		}

		const _jobDone = (err, journeys, job) => {
			if (!jobs.has(job)) return null
			jobs.delete(job)
			onJobDone(err, journeys, job.input, iteration)
			if (--jobsLeft === 0) {
				queue.removeListener('success', onSuccess)
				queue.removeListener('error', onError)
				queue.removeListener('timeout', onTimeout)
				setImmediate(onEnd, iteration)
			}
		}
		const onSuccess = (journeys, job) => _jobDone(null, journeys, job)
		queue.on('success', onSuccess)
		const onError = (err, job) => _jobDone(err, null, job)
		queue.on('error', onError)
		const onTimeout = (_, job) => _jobDone(new Error('timeout'), null, job)
		queue.on('timeout', onTimeout)
	}
	return run
}

module.exports = setup
