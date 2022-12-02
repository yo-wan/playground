"use strict";

const fs = require('fs');

const points = new Map();
points.set('A X', 4);
points.set('A Y', 8);
points.set('A Z', 3);

points.set('B X', 1);
points.set('B Y', 5);
points.set('B Z', 9);

points.set('C X', 7);
points.set('C Y', 2);
points.set('C Z', 6);

let transform = new Map();
transform.set('A X', 'A Z');
transform.set('B X', 'B X');
transform.set('C X', 'C Y');

transform.set('A Y', 'A X');
transform.set('B Y', 'B Y');
transform.set('C Y', 'C Z');

transform.set('A Z', 'A Y');
transform.set('B Z', 'B Z');
transform.set('C Z', 'C X');

let data = fs.readFileSync('input.txt').toString().split('\n');

let earnPoints = 0;
let earnPointsMadElf = 0;
data.forEach(row => {
	earnPoints += points.get(row);
	row = transform.get(row);
	earnPointsMadElf += points.get(row);
});

console.log('What would your total score be if everything goes exactly according to your strategy guide?', earnPoints);
console.log('Following the Elf\'s instructions for the second column, what would your total score be if everything' +
	' goes exactly according to your strategy guide?', earnPointsMadElf);