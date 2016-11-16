function main () {
	await ping();
}

async function ping() {
	for (var i = 0; i < 10; i++) {
		await delay(1000);
		console.log(i + " ping");
	}
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

main();