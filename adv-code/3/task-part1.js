"use strict";

const fs = require('fs');

let getPriorityOfLetter = function (letter) {
	if (letter.toUpperCase() === letter) {
		return parseInt(letter, 36) - 9 + 26;
	}

	return parseInt(letter, 36) - 9;
}

let sumPriorities = 0;

let data = fs.readFileSync('input.txt').toString().split('\r\n');

data.forEach(row => {
	let firstPart = Array.from(row.substring(0, row.length / 2));
	let secondPart = Array.from(row.substring(row.length / 2));

	let duplicated = firstPart.filter(n => secondPart.indexOf(n) > -1);
	sumPriorities += getPriorityOfLetter(duplicated[0]);
});

console.log('Find the item type that appears in both compartments of each rucksack. What is the sum of the' +
	' priorities of those item types?', sumPriorities);
