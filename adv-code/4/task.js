"use strict";

const fs = require('fs');

let getRangeArray = function (range) {
	let parts = range.split('-');
	parts = parts.map(value => Number(value));

	let result = [];
	for (let i = parts[0]; i <= parts[1]; i++) {
		result.push(i);
	}

	return result;
}

let data = fs.readFileSync('input.txt').toString().split('\r\n');
let fullyMatchSum = 0;
let partiallyMatchSum = 0;
data.forEach(row => {

	let segments = row.split(',');

	let firstElfSegments = getRangeArray(segments[0]);
	let secondElfSegments = getRangeArray(segments[1]);

	let intersection = firstElfSegments.filter(value => secondElfSegments.includes(value));

	if (intersection.length) {
		partiallyMatchSum++;
	}

	if (intersection.length === firstElfSegments.length || intersection.length === secondElfSegments.length) {
		fullyMatchSum++;
	}
});

console.log('In how many assignment pairs does one range fully contain the other?', fullyMatchSum);

console.log('In how many assignment pairs do the ranges overlap?', partiallyMatchSum);