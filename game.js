
const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: false
		}
	},
    render: {
		pixelArt: true
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

const game = new Phaser.Game(config);

// Game variables
let playerWallet = 1000;
let currentBid = 50;
let playerBid = 50;

// Game stage management
let currentStage = 'minimap'; // Start with minimap instead of bidding
let inputHandlers = {};
let activeInputHandler = null;

// Minimap variables
let player;
let auctionZone;
let minimapElements = [];

// UI elements
let walletText;
let currentBidText;
let playerBidText;
let increaseButton;
let decreaseButton;
let bidButton;

function preload() {
	// Load assets here
	this.load.image('player', 'images/greve1.png');
}

function create() {
	// Store scene reference for later use
	this.sceneRef = this;
	
	// Initialize input handlers
	setupInputHandlers(this);
	
	// Start with minimap
	setGameStage('minimap');
}

function update(time, delta) {
	// Check collisions in minimap mode
	if (currentStage === 'minimap') {
		checkCollisions();
	}
}

// Bidding functions
function increaseBid() {
	if (playerBid + 10 <= playerWallet) {
		playerBid += 10;
		playerBidText.setText(`$${playerBid}`);
	}
}

function decreaseBid() {
	if (playerBid > 10) {
		playerBid -= 10;
		playerBidText.setText(`$${playerBid}`);
	}
}

function placeBid() {
	if (playerBid > currentBid && playerBid <= playerWallet) {
		currentBid = playerBid;
		currentBidText.setText(`$${currentBid}`);
		playerWallet -= currentBid;
		walletText.setText(`Wallet: $${playerWallet}`);
		
		// Reset player bid to minimum viable bid
		playerBid = Math.min(currentBid + 10, playerWallet);
		if (playerBid <= playerWallet) {
			playerBidText.setText(`$${playerBid}`);
		}
	}
}

// Input Handler System
function setupInputHandlers(scene) {
	// Minimap stage input handler
	inputHandlers.minimap = {
		'UP': () => movePlayer(0, -1),
		'DOWN': () => movePlayer(0, 1),
		'LEFT': () => movePlayer(-1, 0),
		'RIGHT': () => movePlayer(1, 0)
	};
	
	// Bidding stage input handler
	inputHandlers.bidding = {
		'UP': () => increaseBid(),
		'DOWN': () => decreaseBid(),
		'SPACE': () => placeBid(),
		'ENTER': () => placeBid(),
		'ESC': () => exitToMinimap()
	};
	
	// Example: Menu stage input handler (for future use)
	inputHandlers.menu = {
		'UP': () => navigateMenuUp(),
		'DOWN': () => navigateMenuDown(),
		'SPACE': () => selectMenuItem(),
		'ENTER': () => selectMenuItem(),
		'ESC': () => goBackInMenu()
	};
	
	// Example: Results stage input handler (for future use)
	inputHandlers.results = {
		'SPACE': () => continueToNextRound(),
		'ENTER': () => continueToNextRound(),
		'ESC': () => returnToMenu()
	};
	
	// Set up the universal key listener
	scene.input.keyboard.on('keydown', (event) => {
		let keyName = event.code;
		
		// Handle arrow keys
		if (keyName === 'ArrowUp') keyName = 'UP';
		else if (keyName === 'ArrowDown') keyName = 'DOWN';
		else if (keyName === 'ArrowLeft') keyName = 'LEFT';
		else if (keyName === 'ArrowRight') keyName = 'RIGHT';
		// Handle other keys
		else if (keyName === 'Space') keyName = 'SPACE';
		else if (keyName === 'Enter') keyName = 'ENTER';
		else if (keyName === 'Escape') keyName = 'ESC';
		
		if (activeInputHandler && activeInputHandler[keyName]) {
			activeInputHandler[keyName]();
		}
	});
}

function setGameStage(stageName) {
	currentStage = stageName;
	activeInputHandler = inputHandlers[stageName];
	console.log(`Game stage changed to: ${stageName}`);
	
	// Clear existing UI and set up new stage
	if (stageName === 'minimap') {
		setupMinimapUI();
	} else if (stageName === 'bidding') {
		setupBiddingUI();
	}
}

function setupMinimapUI() {
	// Clear existing elements
	clearUI();
	
	// Create minimap background
	const scene = game.scene.scenes[0];
	scene.add.rectangle(400, 300, 800, 600, 0x1a4a3a);
	
	// Create player (using gre1.png image)
	player = scene.add.image(100, 100, 'player');
	
	// Create auction zone (red square)
	auctionZone = scene.add.rectangle(600, 400, 80, 80, 0xff4444);
	scene.add.text(600, 400, 'AUCTION', {
		fontSize: '14px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	}).setOrigin(0.5);
	
	// Instructions
	scene.add.text(50, 50, 'Use arrow keys to move', {
		fontSize: '16px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	});
	
	// Wallet display (always visible)
	walletText = scene.add.text(650, 30, `Wallet: $${playerWallet}`, {
		fontSize: '20px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	});
	
	mimapElements = [player, auctionZone, walletText];
}

function setupBiddingUI() {
	// Clear existing elements
	clearUI();
	
	const scene = game.scene.scenes[0];
	
	// Background
	scene.add.rectangle(400, 300, 800, 600, 0x2c3e50);

	// Wallet display (top right)
	walletText = scene.add.text(650, 30, `Wallet: $${playerWallet}`, {
		fontSize: '24px',
		fill: '#ecf0f1',
		fontFamily: 'Arial'
	});

	// Current bid display (center)
	scene.add.text(400, 200, 'Current Bid:', {
		fontSize: '32px',
		fill: '#ecf0f1',
		fontFamily: 'Arial'
	}).setOrigin(0.5);

	currentBidText = scene.add.text(400, 250, `$${currentBid}`, {
		fontSize: '48px',
		fill: '#e74c3c',
		fontFamily: 'Arial',
		fontStyle: 'bold'
	}).setOrigin(0.5);

	// Player bidding section (bottom)
	scene.add.text(400, 450, 'Your Bid:', {
		fontSize: '24px',
		fill: '#ecf0f1',
		fontFamily: 'Arial'
	}).setOrigin(0.5);

	playerBidText = scene.add.text(400, 490, `$${playerBid}`, {
		fontSize: '32px',
		fill: '#3498db',
		fontFamily: 'Arial',
		fontStyle: 'bold'
	}).setOrigin(0.5);

	// Decrease button
	decreaseButton = scene.add.rectangle(250, 540, 80, 40, 0xe74c3c)
		.setInteractive()
		.on('pointerdown', () => decreaseBid());

	scene.add.text(250, 540, '-$10', {
		fontSize: '18px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	}).setOrigin(0.5);

	// Increase button
	increaseButton = scene.add.rectangle(350, 540, 80, 40, 0x27ae60)
		.setInteractive()
		.on('pointerdown', () => increaseBid());

	scene.add.text(350, 540, '+$10', {
		fontSize: '18px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	}).setOrigin(0.5);

	// Place bid button
	bidButton = scene.add.rectangle(500, 540, 100, 40, 0xf39c12)
		.setInteractive()
		.on('pointerdown', () => placeBid());

	scene.add.text(500, 540, 'Place Bid', {
		fontSize: '16px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	}).setOrigin(0.5);
	
	// Exit instruction
	scene.add.text(50, 50, 'Press ESC to return to map', {
		fontSize: '16px',
		fill: '#ecf0f1',
		fontFamily: 'Arial'
	});
}

function clearUI() {
	const scene = game.scene.scenes[0];
	scene.children.removeAll();
}

// Placeholder functions for future stages
function navigateMenuUp() {
	console.log('Navigate menu up');
}

function navigateMenuDown() {
	console.log('Navigate menu down');
}

function selectMenuItem() {
	console.log('Select menu item');
}

function goBackInMenu() {
	console.log('Go back in menu');
}

function continueToNextRound() {
	console.log('Continue to next round');
}

function returnToMenu() {
	console.log('Return to menu');
	// Example: setGameStage('menu');
}

// Minimap functions
function movePlayer(deltaX, deltaY) {
	if (!player) return;
	
	const speed = 5;
	const newX = player.x + (deltaX * speed);
	const newY = player.y + (deltaY * speed);
	
	// Keep player within bounds
	if (newX >= 15 && newX <= 785 && newY >= 15 && newY <= 585) {
		player.x = newX;
		player.y = newY;
		
		// Check collision with auction zone
		checkCollisions();
	}
}

function checkCollisions() {
	if (!player || !auctionZone) return;
	
	// Simple collision detection
	const distance = Phaser.Math.Distance.Between(
		player.x, player.y, 
		auctionZone.x, auctionZone.y
	);
	
	if (distance < 50) {
		// Enter auction minigame
		setGameStage('bidding');
	}
}

function exitToMinimap() {
	setGameStage('minimap');
}
