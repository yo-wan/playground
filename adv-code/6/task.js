"use strict";

const fs = require('fs');

let input = fs.readFileSync('input.txt').toString();

let packetCharLimit = 4;
for (let i = 0; i < input.length; i++) {
	let packet = input.substring(i, i + packetCharLimit);

	let uniqueSeq = new Set(packet.split(''));

	if (uniqueSeq.size === packetCharLimit) {
		console.log('How many characters need to be processed before the first start-of-packet marker is detected?', i + packetCharLimit);
		break;
	}

	packet = '';
}

packetCharLimit = 14;
input = fs.readFileSync('input.txt').toString();
for (let i = 0; i < input.length; i++) {
	let packet = input.substring(i, i + packetCharLimit);

	let uniqueSeq = new Set(packet.split(''));

	if (uniqueSeq.size === packetCharLimit) {
		console.log('How many characters need to be processed before the first start-of-message marker is detected?', i + packetCharLimit);
		break;
	}

	packet = '';
}

