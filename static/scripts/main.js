const ABI = {
    "data": [{"inputs":[],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_toTokenId","type":"uint256"}],"name":"BatchMetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"MetadataUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"destruct","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"string","name":"uri","type":"string"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"},{"internalType":"string[]","name":"uris","type":"string[]"}],"name":"mintMultiple","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]
}
const HEIGHT = 30;
const WIDTH = 30;
var color;
var counter = 0;
var disabled;
var svg;

async function web3_mint(ids, uris) {
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const signer = provider.getSigner();
	const contract = new ethers.Contract("0xb52bBc6644585379a53caC42a14015d0eee5a4Af", ABI.data, signer);
	contract.connect(signer);

	if (ids.length === uris.length) {
		let transaction = await contract.mintMultiple(ids, uris, {value: ethers.utils.parseEther("" + 0.001 * ids.length)}).catch((e) => {
			if (e.code === -32603) {
				alert("Block gas limit exceeded. Consider minting less tokens or reduce their data.");
			} else if (e.code === "ACTION_REJECTED") {
				alert("Transaction has been rejected.");
			}

			return;
        });

		await transaction.wait().then(function(r) {
			disabled = true;
			if (r.status === 1) {
				$("div.pixel.clicked").each(function() {
					$(this).removeClass("clicked");
					$(this).addClass("used");
					$("span#count").text("0");
				});
				disabled = false;
			}
		});
	}
}

function fetch_data(id) {
	$.ajax({
		type: "GET",
		url: `/token-uri/${id}`,
		tried: 0,
		retries: 1,
		complete: function() {
			counter += 100 / (HEIGHT * WIDTH);
			$("div#bar").css("width", `${counter}%`);

			if (counter >= 100) {
				disabled = false;
				$("div#progress").hide();
			}
		},
		error: function(xhr) {
			if (xhr.status === 404 || xhr.status === 500) {
				this.tried++;

				if (this.tried <= this.retries) {
					$.ajax(this);
					return;
				}
			}
		},
		success: function(data) {
			const pixel = $(`div#pixel-${id}`);
			pixel.addClass("used");
			pixel.append(`<img src="${data}">`);
		}
	});
}

function random_sequence() {
	const min = 1;
	const max = HEIGHT * WIDTH;
	const used = [];

	while (used.length < max) {
		let number;

		do {
			number = Math.floor(Math.random() * max) + min;
		} while (used.includes(number));

		used.push(number);
		fetch_data(number);
	}

	return used;
}

function draw_map() {
	disabled = true;
	let iteration = 0;
	const map = $("div#map");
	
	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
			iteration++;
			map.append($(`<div class="pixel" id="pixel-${iteration}"></div>`));
		}
	}

	random_sequence();
}

function clear_svg() {
	svg = null;
	$("input#svg.form-control").val("");
}

$(document).ready(function() {
	clear_svg();
	draw_map();

	color = $("input#picker").val();
	$("input#picker").on("change", function(e) {
		color = e.currentTarget.value;
	});

	$("input#svg.form-control").on("change", function(e) {
		const file = e.target.files[0];

		if (file) {
			const reader = new FileReader();

			reader.onload = function(e) {
				svg = e.target.result;
			};

			reader.readAsText(file);
		}
	});

	$("a#cart").on("click", function() {
		if (window.ethereum) {
			if ($("div.pixel.clicked").length) {
				const ids = [];
				const uris = [];

				$("div.pixel.clicked").each(function() {
					const clicked = $(this);
					ids.push(clicked.attr("id").split("-")[1]);
					uris.push("data:image/svg+xml;base64," + btoa(clicked.html()));
				});

				web3_mint(ids, uris);
			}
		} else {
			alert("Please enable Web3 client like MetaMask to mint.");
		}
	});

	$("div.pixel").on("click", function() {
		const pixel = $(this);

		if (disabled || pixel.hasClass("used")) {
			return;
		}

		if (pixel.hasClass("clicked")) {
			pixel.empty();
			pixel.toggleClass("clicked");
		} else {
			if (svg) {
				pixel.append(svg);
			} else {
				pixel.append(`<svg enable-background="new 0 0 128 128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><rect fill="${color}" height="100%" width="100%"/></svg>`);
			}

			pixel.toggleClass("clicked");
		}

		$("span#count").text($("div.pixel.clicked").length);
	});

	$("button#svg-delete.btn.btn-danger").on("click", function() {
		clear_svg();
	});
});
