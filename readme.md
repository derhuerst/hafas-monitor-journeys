# hafas-monitor-journeys

**Use any HAFAS API to monitor journeys from A to B.**

[![npm version](https://img.shields.io/npm/v/hafas-monitor-journeys.svg)](https://www.npmjs.com/package/hafas-monitor-journeys)
[![build status](https://api.travis-ci.org/derhuerst/hafas-monitor-journeys.svg?branch=master)](https://travis-ci.org/derhuerst/hafas-monitor-journeys)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/hafas-monitor-journeys.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)


## Installing

```shell
npm install hafas-monitor-journeys
```


## Usage

```js
const hafas = require('vbb-hafas')
const monitor = require('hafas-monitor-journeys')

const leinestr = '900000079201'
const schönleinstr = '900000016201'

const tasks = [{
	from: leinestr,
	to: schönleinstr,
	when: t => t, // query for the current point in time
}, {
	from: leinestr,
	to: schönleinstr,
	when: t => t + 10 * 60 * 1000 // query 10 minutes ahead
}]

const onJobDone = (err, journeys, job, iteration) => {
	if (err) return console.error(err)

	const ahead = Math.round((job.when - job.started) / 1000)
	console.log(
		'iteration ' + iteration,
		ahead + 's ahead',
		journeys.length + ' journeys'
	)
}

const onEnd = (iteration) => {
	console.log('iteration ' + iteration + ' done')
}

const run = monitor(hafas.journeys, tasks)
run(onJobDone, onEnd)
```

```
iteration 1 0s ahead 5 journeys
iteration 1 600s ahead 5 journeys
iteration 1 done
```


## Contributing

If you have a question or have difficulties using `hafas-monitor-journeys`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/hafas-monitor-journeys/issues).
