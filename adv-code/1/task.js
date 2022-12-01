"use strict";

const fs = require('fs');

let data = fs.readFileSync('input.txt').toString().split('\r\n');

let elfCalories = []

let elfCount = 0;
let sum = 0;
data.forEach(row => {
	if (row === '') {
		elfCalories[elfCount] = sum;
		sum = 0
		elfCount++;
	} else {
		sum += Number(row);
	}
});

elfCalories.sort((a, b) => {
	return a - b;
});

let mostCalories = elfCalories.pop()

console.log('Find the Elf carrying the most Calories. How many total Calories is that Elf carrying?', mostCalories);

console.log('Find the top three Elves carrying the most Calories. How many Calories are those Elves carrying in' +
	' total?', mostCalories + elfCalories.pop() + elfCalories.pop());
