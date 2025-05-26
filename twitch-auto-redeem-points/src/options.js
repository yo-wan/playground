chrome.storage.sync.get(null, (data) => {
	const tbody = document.querySelector("#statsTable tbody");

	console.log(4, data)

	let allPoints = 0;
	Object.entries(data).forEach(([channel, points]) => {
		if (channel.indexOf('twitch.tv') >= 0) {
			let twitchChannel = channel.split('/').reverse()[0]

			const row = document.createElement("tr");

			const channelLink = document.createElement('a');
			channelLink.innerHTML = twitchChannel;
			channelLink.setAttribute('href', channel);

			const nameCell = document.createElement("td");
			nameCell.appendChild(channelLink)

			const pointsCell = document.createElement("td");
			pointsCell.textContent = points.toLocaleString();

			row.appendChild(nameCell);
			row.appendChild(pointsCell);
			tbody.appendChild(row);

			allPoints += Number(points);
		}
	});

	if (allPoints) {
		const row = document.createElement("tr");

		const nameCell = document.createElement("td");
		nameCell.textContent = 'All Collected Points';

		const pointsCell = document.createElement("td");
		pointsCell.textContent = allPoints.toLocaleString();

		row.appendChild(nameCell);
		row.appendChild(pointsCell);
		tbody.appendChild(row);
	}
});