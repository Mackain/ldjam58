
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
let playerWallet = 500;
let currentBid = 10;
let playerBid = 20;

// Game stage management
let currentStage = 'minimap'; // Start with minimap instead of bidding
let inputHandlers = {};
let activeInputHandler = null;

// Minimap variables
let greve;
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
	this.load.image('greve1', 'images/greve1.png');
	this.load.image('greve2', 'images/greve2.png');
	this.load.image('greve3', 'images/greve3.png');
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

function placeBid() {
	// Check if player has enough money to bid $10 more
	if (playerWallet >= 10) {
		// Increase current bid by $10
		currentBid += 10;
		currentBidText.setText(`$${currentBid}`);
		playerWallet -= 10;
		walletText.setText(`Wallet: $${playerWallet}`);
		
		// Update player bid display to show next potential bid
		playerBid = currentBid + 10;
		if (playerBidText) {
			playerBidText.setText(`$${playerBid}`);
		}
	}
	botPlaceBid();
}

function botPlaceBid() {
	
}

// Input Handler System
function setupInputHandlers(scene) {
	// Minimap stage input handler
	inputHandlers.minimap = {
		'UP': () => { movePlayer(0, -1); startWalkAnimation(); },
		'DOWN': () => { movePlayer(0, 1); startWalkAnimation(); },
		'LEFT': () => { movePlayer(-1, 0); startWalkAnimation(); },
		'RIGHT': () => { movePlayer(1, 0); startWalkAnimation(); }
	};
	
	// Bidding stage input handler
	inputHandlers.bidding = {
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
	
	// Create player with animation
	greve = scene.add.sprite(100, 100, 'greve1');
	
	// Create walking animation
	scene.anims.create({
		key: 'walk',
		frames: [
			{ key: 'greve1' },
			{ key: 'greve2' },
			{ key: 'greve3' },
			{ key: 'greve2' }
		],
		frameRate: 18,
		repeat: -1
	});
	
	// Create idle animation (just greve1)
	scene.anims.create({
		key: 'idle',
		frames: [{ key: 'greve1' }],
		frameRate: 1
	});
	
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
	
	mimapElements = [greve, auctionZone, walletText];
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
	if (!greve) return;
	
	const speed = 5;
	const newX = greve.x + (deltaX * speed);
	const newY = greve.y + (deltaY * speed);
	
	// Keep player within bounds
	if (newX >= 15 && newX <= 785 && newY >= 15 && newY <= 585) {
		greve.x = newX;
		greve.y = newY;
		
		// Play walking animation
		if (greve.anims) {
			greve.anims.play('walk', true);
		}
		
		// Check collision with auction zone
		checkCollisions();
	}
}

function checkCollisions() {
	if (!greve || !auctionZone) return;
	
	// Simple collision detection
	const distance = Phaser.Math.Distance.Between(
		greve.x, greve.y, 
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

// Animation helper functions
let walkingTimeout;

function startWalkAnimation() {
	// Clear any existing timeout
	if (walkingTimeout) {
		clearTimeout(walkingTimeout);
	}
	
	// Stop walking animation after a short delay
	walkingTimeout = setTimeout(() => {
		if (greve && greve.anims) {
			greve.anims.play('idle');
		}
	}, 150); // Stop animation 150ms after last movement
}
