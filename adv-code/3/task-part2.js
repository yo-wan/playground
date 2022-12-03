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

for (let i = 0; i < data.length; i += 3) {
	let firstLineArr = Array.from(data[i]);
	let secondLineArr = Array.from(data[i + 1]);
	let thirdLineArr = Array.from(data[i + 2]);

	let badge = firstLineArr.filter(n => secondLineArr.indexOf(n) > -1 && thirdLineArr.indexOf(n) > -1);
	sumPriorities += getPriorityOfLetter(badge[0]);
}

console.log('Find the item type that corresponds to the badges of each three-Elf group. What is the sum of the' +
	' priorities of those item types?', sumPriorities);