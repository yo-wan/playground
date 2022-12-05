"use strict";

const fs = require('fs');

let getInstructions = function (inputData) {
	return inputData.slice(10);
}

let getContainers = function (inputData) {
	let header = inputData[8].split('   ');
	header = header.map(v => Number(v.trim()));

	let inputContainers = inputData.slice(0, 8);

	let result = new Map();

	let j = 1;

	for (let i = 1; i <= header.length; i++) {
		let arrayValuesByColumn = [];
		inputContainers.forEach(row => {
			if (row[j] !== undefined && row[j].trim().length) {
				arrayValuesByColumn.push(row[j]);
			}
		});

		result.set(i, arrayValuesByColumn);
		j += 4;
	}

	return result;
}

let moveContainers = function (row, inputMap, moveAtOnce = false) {
	let moveContainersCount = Number(row.substring(row.indexOf('move ') + 5, row.indexOf(' from')));
	let moveContainersFrom = Number(row.substring(row.indexOf('from ') + 6, row.indexOf('from ') + 5));
	let moveContainersTo = Number(row.substring(row.indexOf('to ') + 3));

	let fromContainersArray = Array.from(inputMap.get(moveContainersFrom));
	let moveContainers = fromContainersArray.splice(0, moveContainersCount)
	if (!moveAtOnce) {
		moveContainers = moveContainers.reverse();
	}

	let toContainersArray = Array.from(inputMap.get(moveContainersTo));

	inputMap.set(moveContainersFrom, fromContainersArray);
	inputMap.set(moveContainersTo, [...moveContainers,
		...toContainersArray]);

	return inputMap;
}

let input = fs.readFileSync('input.txt').toString().split('\n');

let instructions = getInstructions(input);
let containersNormalized = getContainers(input);
let containersWithoutOrder = new Map(containersNormalized);

instructions.forEach(row => {
	containersNormalized = moveContainers(row, containersNormalized);
	containersWithoutOrder = moveContainers(row, containersWithoutOrder, true);
});

let topContainers = '';
containersNormalized.forEach((row) => {
	if (row[0] !== undefined) {
		topContainers += row[0];
	}
});

console.log('After the rearrangement procedure completes, what crate ends up on top of each stack?', topContainers);

topContainers = '';
containersWithoutOrder.forEach((row) => {
	if (row[0] !== undefined) {
		topContainers += row[0];
	}
});

console.log('After the rearrangement procedure completes, what crate ends up on top of each stack?', topContainers);