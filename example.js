'use strict'

const {DateTime} = require('luxon')
const hafas = require('vbb-hafas')

const setup = require('.')

const later = (delta) => (t) => {
	return DateTime.fromMillis(t, {
		zone: 'Europe/Berlin',
		locale: 'de-DE'
	})
	.plus(delta)
	.valueOf()
}

const potsdamHbf = '900000230999'
const ostbahnhof = '900000120005'
const leinestr = '900000079201'
const schönleinstr = '900000016201'
const tasks = [{
	from: potsdamHbf,
	to: ostbahnhof,
	when: later({days: 1})
}, {
	from: potsdamHbf,
	to: ostbahnhof,
	when: later({days: 2})
}, {
	from: potsdamHbf,
	to: ostbahnhof,
	when: later({days: 3})
}, {
	from: leinestr,
	to: schönleinstr,
	when: t => t,
}, {
	from: leinestr,
	to: schönleinstr,
	when: later({minutes: 10})
}, {
	from: leinestr,
	to: schönleinstr,
	when: later({minutes: 20})
}]

const onResult = (err, journeys, job) => {
	if (err) return console.error(err)

	console.log(
		job.iteration,
		job.from,
		job.to,
		new Date(job.when),
		new Date(job.started),
		journeys.length
	)
}

const onDone = (iteration) => {
	console.log('iteration ' + iteration + ' done!')
}

const run = setup(hafas.journeys, tasks, onResult)
setTimeout(run, 100, onDone)
setTimeout(run, 200, onDone)
