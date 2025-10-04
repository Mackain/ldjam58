
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
let fancyStuffs = 0;

// Auction
let currentBid = 10;
let playerBid = 20; // Will be updated to currentBid + 10 when auction starts
let bidWinningProbability = 1;
let auctionTimer = 5;
let auctionTimerText;
let timerInterval;
let lastBidder = null; // 'player' or 'bot'


// Game stage management
let currentStage = 'minimap';
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
let bidButtonText;
let auctionBackground;
let auctionAudience;

function preload() {
	// Load assets here
	this.load.image('greve1', 'images/greve1.png');
	this.load.image('greve2', 'images/greve2.png');
	this.load.image('greve3', 'images/greve3.png');
	this.load.image('auq1', 'images/auq1.png');
	this.load.image('auq2', 'images/auq2.png');
	this.load.image('aud1', 'images/aud1.png');
	this.load.image('aud2', 'images/aud2.png');
	this.load.image('aud3', 'images/aud3.png');
	this.load.image('auqhand', 'images/auqhand.png');
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
	
	// Update auction timer display
	if (currentStage === 'bidding' && auctionTimerText) {
		auctionTimerText.setText(`Time: ${auctionTimer}`);
	}
}

function placeBid() {
	// Check if player has enough money to bid $10 more
	if (lastBidder === "player") {
		return; 
	}
	if (playerWallet >= currentBid + 10) {
		// Increase current bid by $10
		currentBid += 10;
		currentBidText.setText(`$${currentBid}`);
		walletText.setText(`Wallet: $${playerWallet}`);
		
		// Player placed a bid - reset timer
		lastBidder = 'player';
		resetAuctionTimer();
	}
	botPlaceBid();
	if (playerWallet >= currentBid + 10) {
			// Update player bid display to show next potential bid
		playerBid = currentBid + 10;
		if (playerBidText) {
			playerBidText.setText(`$${playerBid}`);
		}
		// Update bid button text
		if (bidButtonText) {
			bidButtonText.setText(`Place Bid $${playerBid}`);
		}
	}
}

function botPlaceBid() {
	// Add delay before bot makes decision (1-3 seconds)
	setTimeout(() => {
		let botBidChance = Math.floor(Math.random() * 10) + 1;
		if (botBidChance > bidWinningProbability) {
			currentBid += 10;
			currentBidText.setText(`$${currentBid}`);
			bidWinningProbability++;
			console.log("botBidChance: " + botBidChance);
			console.log("Bot places a bid. Current bid is now $" + currentBid);
			
			// Show bot bid hand in audience
			showBotBidHand();
			
			// Bot placed a bid - reset timer
			lastBidder = 'bot';
			
			// Update player bid and button text
			playerBid = currentBid + 10;
			if (bidButtonText) {
				bidButtonText.setText(`Place Bid $${playerBid}`);
			}
		} else {
			console.log("botBidChance: " + botBidChance);
			console.log('Bot decides not to bid this round.');
			// Don't automatically win - let timer decide
		}
	}, Math.floor(Math.random() * 2000) + 1000); // 1-3 second delay
}

function biddingWon() {
	console.log("Bidding won!");
	fancyStuffs++;
	playerWallet -= currentBid;
	walletText.setText(`Wallet: $${playerWallet}`);
	currentBid = 10;
	bidWinningProbability = 1;
	playerBid = currentBid + 10; // Always 10 more than current bid
	if (playerBidText) {
		playerBidText.setText(`$${playerBid}`);
	}
	setupBiddingUI();
}

function biddingLost() {
	console.log("Bidding lost!");
	currentBid = 10;
	bidWinningProbability = 1;
	playerBid = currentBid + 10; // Always 10 more than current bid
	if (playerBidText) {
		playerBidText.setText(`$${playerBid}`);
	}
	setupBiddingUI();
	// Could add UI feedback here later
}

// Timer management functions
function startAuctionTimer() {
	auctionTimer = 5;
	lastBidder = null;
	if (timerInterval) {
		clearInterval(timerInterval);
	}
	timerInterval = setInterval(() => {
		auctionTimer--;
		if (auctionTimerText) {
			auctionTimerText.setText(`Time: ${auctionTimer}`);
		}
		
		if (auctionTimer <= 0) {
			// Timer reached zero - determine winner
			if (lastBidder === 'player') {
				biddingWon();
			} else {
				biddingLost();
			}
		}
	}, 1000);
}

function resetAuctionTimer() {
	auctionTimer = 5;
	if (auctionTimerText) {
		auctionTimerText.setText(`Time: ${auctionTimer}`);
	}
}

function stopAuctionTimer() {
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}
}

function showBotBidHand() {
	// Only show hand if we're in bidding stage
	if (currentStage !== 'bidding') return;
	
	const scene = game.scene.scenes[0];
	
	// Generate random x position across the width of the screen
	const randomX = Math.random() * 700 + 50; // Between 50 and 750 to keep within bounds
	
	// Position hand in audience area (around middle to lower part of screen)
	const handY = Math.random() * 80 + 350; // Between 300 and 500 pixels down
	
	// Create the hand sprite
	const handSprite = scene.add.image(randomX, handY, 'auqhand');
	
	// Make sure the hand appears above the audience animation
	handSprite.setDepth(10);
	
	// Remove the hand after 1 second (1000 milliseconds)
	setTimeout(() => {
		if (handSprite && handSprite.scene) {
			handSprite.destroy();
		}
	}, 1000);
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
	
	// Animated background
	auctionBackground = scene.add.sprite(400, 300, 'auq1');
	auctionBackground.setDisplaySize(800, 600);
	
	// Create auction background animation
	scene.anims.create({
		key: 'auction_bg',
		frames: [
			{ key: 'auq1' },
			{ key: 'auq2' }
		],
		frameRate: 4,
		repeat: -1
	});
	
	// Start the background animation
	auctionBackground.anims.play('auction_bg', true);
	
	// Audience animation layer on top of background
	auctionAudience = scene.add.sprite(400, 300, 'aud1');
	auctionAudience.setDisplaySize(800, 600);
	
	// Create audience animation
	scene.anims.create({
		key: 'auction_audience',
		frames: [
			{ key: 'aud1' },
			{ key: 'aud2' },
			{ key: 'aud3' }
		],
		frameRate: 4, // Slightly faster than background
		repeat: -1
	});
	
	// Start the audience animation
	auctionAudience.anims.play('auction_audience', true);

	// Auction timer display (top center)
	auctionTimerText = scene.add.text(400, 30, `Time: ${auctionTimer}`, {
		fontSize: '32px',
		fill: '#f39c12',
		fontFamily: 'Arial',
		fontStyle: 'bold'
	}).setOrigin(0.5);

	// Wallet display (top right)
	walletText = scene.add.text(650, 30, `Wallet: $${playerWallet}`, {
		fontSize: '24px',
		fill: '#ecf0f1',
		fontFamily: 'Arial'
	});
	
	// Initialize playerBid to be current bid + 10
	playerBid = currentBid + 10;
	
	// Start the auction timer
	startAuctionTimer();

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

	// Place bid button
	bidButton = scene.add.rectangle(500, 540, 100, 40, 0xf39c12)
		.setInteractive()
		.on('pointerdown', () => placeBid());

	bidButtonText = scene.add.text(500, 540, `Place Bid $${playerBid}`, {
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
	stopAuctionTimer();
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
