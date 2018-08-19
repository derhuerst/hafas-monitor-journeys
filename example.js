'use strict'

const createHafas = require('vbb-hafas')

const monitor = require('.')

const potsdamHbf = '900000230999'
const ostbahnhof = '900000120005'
const leinestr = '900000079201'
const schönleinstr = '900000016201'
const ahead = delta => t => t + delta
const minute = 60 * 1000
const day = 24 * 60 * minute

const tasks = [{
	from: potsdamHbf,
	to: ostbahnhof,
	when: ahead(1 * day)
}, {
	from: potsdamHbf,
	to: ostbahnhof,
	when: ahead(2 * day)
}, {
	from: potsdamHbf,
	to: ostbahnhof,
	when: ahead(3 * day)
}, {
	from: leinestr,
	to: schönleinstr,
	when: t => t,
}, {
	from: leinestr,
	to: schönleinstr,
	when: ahead(10 * minute)
}, {
	from: leinestr,
	to: schönleinstr,
	when: ahead(20 * minute)
}]

const onJobDone = (err, journeys, job, iteration) => {
	if (err) return console.error(err)

	console.log(
		iteration,
		job.from,
		job.to,
		new Date(job.when),
		new Date(job.started),
		journeys.length
	)
}

const onEnd = (iteration) => {
	console.log('iteration ' + iteration + ' done!')
}

const hafas = createHafas('hafas-monitor-departures example')
const run = monitor(hafas.journeys, tasks)
setTimeout(run, 100, onJobDone, onEnd)
setTimeout(run, 200, onJobDone, onEnd)
