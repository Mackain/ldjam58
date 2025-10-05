
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

// Volume variables
let musicVolume = 0.5;
let sfxVolume = 0.5;

// Game variables
let playerWallet = 500;
let fancyStuffs = 0;
let socialStatus = 100;
let syphilis = 1;

// Auction
let currentBid = 10;
let playerBid = 20; // Will be updated to currentBid + 10 when auction starts
let bidWinningProbability = 1;
let auctionTimer = 5;
let auctionTimerText;
let timerInterval;
let lastBidder = null; // 'player' or 'bot'
let artifactDisplayPositionX = 520;
let artifactDisplayPositionY = 200;

// Artifact display system
let currentArtifactSprite = null;
let artifactAnimationState = 'none'; // 'flying_in', 'displayed', 'flying_out', 'none'
let availableArtifacts = ['artifact1', 'artifact2', 'artifact3', 'artifact4', 'artifact5', 'artifact6', 'artifact7', 'artifact8', 'artifact9', 'artifact10'];

// Auction state management
let isExitingAuction = false;
let soldAnimationTimeout = null;


// Game stage management
let currentStage = 'splash';
let inputHandlers = {};
let activeInputHandler = null;

// Splash screen variables
let splashSprite = null;
let splashAnimationsCreated = false;

// WorldMap variables
let greve;
let auctionZone;
let worldMapElements = [];

// Map locations system
let mapLocations = [
	{ x: 235, y: 220, name: "Home", minigame: "sidescroller" },
	{ x: 270, y: 300, name: "Paris", minigame: "bidding" },
	{ x: 535, y: 540, name: "Giza", minigame: "giza" }
	// Add more locations as needed - you can adjust coordinates based on your map.png
];
let currentLocationIndex = 0;

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
let leadingBidText;

// HUD elements
let hudGoldText;
let hudSocialStatusBar;
let hudSocialStatusBackground;
let hudSyphilisBar;
let hudSyphilisBackground;

// Audio elements
let auctionClubSound;
let flaxxxSound;
let syphilisSound;
let worldMapMusic;
let sidescrollerMusic;
let gizaMusic;
let auctionMusic;
let mummyMunchSound;
let camelCrushSound;
let splashMusic;

// Sidescroller game variables
let sidescrollerPlayer;
let obstacles = [];
let isJumping = false;
let jumpVelocity = 0;
let gravity = 0.8;
let groundY = 500;
let gameSpeed = 8;
let obstacleSpawnTimer = 0;
let sidescrollerBackground;
let isGamePaused = false;
let pauseTimer = 0;
let pesantShakeAnimationCreated = false;
let sidescrollerAnimationsCreated = false;
let isCollisionImmune = false;
let immunityTimer = 0;

// Giza game variables
let gizaFallingObjects = [];
let gizaSpawnTimer = 0;
let gizaAnimationsCreated = false;

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
	this.load.image('auqSOLD', 'images/auqSOLD.png');
	this.load.image('map', 'images/map.png');
	this.load.image('greveSkak1', 'images/greveSkak1.png');
	this.load.image('greveSkak2', 'images/greveSkak2.png');
	this.load.image('droska1', 'images/droska1.png');
	this.load.image('droska2', 'images/droska2.png');
	this.load.image('bonde1', 'images/bonde1.png');
	this.load.image('bonde2', 'images/bonde2.png');
	this.load.image('bonde3', 'images/bonde3.png');
	this.load.image('bonde4', 'images/bonde4.png');
	this.load.image('hay', 'images/hay.png');
	this.load.image('giza', 'images/giza.png');
	this.load.image('camel1', 'images/camel1.png');
	this.load.image('camel2', 'images/camel2.png');
	this.load.image('greveNom', 'images/greveNom.png');
	this.load.image('greveOm', 'images/greveOm.png');
	this.load.image('mummy', 'images/mummy.png');
	this.load.image('artifact1', 'images/artifact1.png');
	this.load.image('artifact2', 'images/artifact2.png');
	this.load.image('artifact3', 'images/artifact3.png');
	this.load.image('artifact4', 'images/artifact4.png');
	this.load.image('artifact5', 'images/artifact5.png');
	this.load.image('artifact6', 'images/artifact6.png');
	this.load.image('artifact7', 'images/artifact7.png');
	this.load.image('artifact8', 'images/artifact8.png');
	this.load.image('artifact9', 'images/artifact9.png');
	this.load.image('artifact10', 'images/artifact10.png');
	this.load.image('splash', 'images/splash.png');
	this.load.image('splashBlink', 'images/splashBlink.png');
	
	// Load audio files
	this.load.audio('auctionClub', 'sounds/Auction-club.mp3');
	this.load.audio('Flaxxx', 'sounds/Flaxxx.mp3');
	this.load.audio('syphilis', 'sounds/Syphilis.mp3');
	this.load.audio('worldMapMusic', 'sounds/Among-the-Cheese-and-Wine-(overworld).mp3');
	this.load.audio('sidescrollerMusic', 'sounds/Early-Retirement-Fund-Withdrawal-chasing-peasants).mp3');
	this.load.audio('gizaMusic', 'sounds/Mummy-Make-My-Day-(egypt).mp3');
	this.load.audio('auctionMusic', 'sounds/La-Collection-de-Excellance-(auction-house).mp3');
	this.load.audio('mummyMunchSound', 'sounds/Mummy-munch.mp3');
	this.load.audio('camelCrushSound', 'sounds/Camel-crush.mp3');
	this.load.audio('splashMusic', 'sounds/RuleBritannia.mp3');
}

function create() {
	// Store scene reference for later use
	this.sceneRef = this;
	
	// Create audio objects
	auctionClubSound = this.sound.add('auctionClub', { volume: sfxVolume });
	syphilisSound = this.sound.add('syphilis', { volume: sfxVolume });
	flaxxxSound = this.sound.add('Flaxxx', { volume: sfxVolume });
	worldMapMusic = this.sound.add('worldMapMusic', { volume: musicVolume, loop: true });
	sidescrollerMusic = this.sound.add('sidescrollerMusic', { volume: musicVolume, loop: true });
	gizaMusic = this.sound.add('gizaMusic', { volume: musicVolume, loop: true });
	auctionMusic = this.sound.add('auctionMusic', { volume: musicVolume, loop: true });
	mummyMunchSound = this.sound.add('mummyMunchSound', { volume: sfxVolume * 1.2 });
	camelCrushSound = this.sound.add('camelCrushSound', { volume: sfxVolume });
	splashMusic = this.sound.add('splashMusic', { volume: musicVolume, loop: true });
	
	// Initialize input handlers
	setupInputHandlers(this);
	
	// Start with splash screen
	setGameStage('splash');
}

function update(time, delta) {
	// Update auction timer display
	if (currentStage === 'bidding' && auctionTimerText) {
		auctionTimerText.setText(`Time: ${auctionTimer}`);
	}
	
	// Update sidescroller game
	if (currentStage === 'sidescroller') {
		updateSidescroller();
	}

	// Update giza game
	if (currentStage === 'giza') {
		updateGiza();
	}
	if (currentStage !== 'splash') {
		socialStatus -= 0.01;
		syphilis = syphilis < 1 ? 1 : syphilis + 0.005;
		
		// Update HUD with current values
		updateHUD();
	 }
	//console.log("socialStatus: " + socialStatus);
	console.log("syphilis: " + syphilis);
	if (syphilis > 100) {
		// Game over logic here
		console.log("Game Over: Syphilis reached critical level!");
	 }
}

function placeBid() {
	// Check if player has enough money to bid 10 more gold
	if (lastBidder === "player") {
		return; 
	}
	if (playerWallet >= currentBid + 10) {
		// Increase current bid by 10 gold
		currentBid += 10;
		currentBidText.setText(`${currentBid} Gold`);
		walletText.setText(`Wallet: ${playerWallet} Gold`);
		
		// Player placed a bid - reset timer
		lastBidder = 'player';
		updateLeadingBidText();
		resetAuctionTimer();
	}
	botPlaceBid();
	if (playerWallet >= currentBid + 10) {
			// Update player bid display to show next potential bid
		playerBid = currentBid + 10;
		if (playerBidText) {
			playerBidText.setText(`${playerBid} Gold`);
		}
		// Update bid button text
		if (bidButtonText) {
			bidButtonText.setText(`Press space to place bid ${playerBid} Gold`);
		}
	}
}

function botPlaceBid() {
	// Add delay before bot makes decision (1-3 seconds)
	setTimeout(() => {
		let botBidChance = Math.floor(Math.random() * 10) + 1;
		if (botBidChance > bidWinningProbability) {
			currentBid += 10;
			currentBidText.setText(`${currentBid} Gold`);
			bidWinningProbability++;
			console.log("botBidChance: " + botBidChance);
			console.log("Bot places a bid. Current bid is now " + currentBid + " Gold");

			// Show bot bid hand in audience
			showBotBidHand();
			
			// Bot placed a bid - reset timer
			lastBidder = 'bot';
			updateLeadingBidText();
			
			// Update player bid and button text
			playerBid = currentBid + 10;
			if (bidButtonText) {
				bidButtonText.setText(`Press space to place bid ${playerBid} Gold`);
			}
		} else {
			console.log("botBidChance: " + botBidChance);
			console.log('Bot decides not to bid this round.');
			// Don't automatically win - let timer decide
		}
	}, Math.floor(Math.random() * 2000) + 1000); // 1-3 second delay
}

function biddingWon() {
	// Don't execute if we're exiting
	if (isExitingAuction) return;
	
	console.log("Bidding won!");	
	fancyStuffs++;
	socialStatus += 20;
	playerWallet -= currentBid;
	walletText.setText(`Wallet: ${playerWallet} Gold`);
}

function resetAuctionForNextRound() {
	currentBid = 10;
	bidWinningProbability = 1;
	playerBid = currentBid + 10; // Always 10 more than current bid
	lastBidder = null;
	setupBiddingUI();
	
	// Update UI elements that exist
	if (playerBidText) {
		playerBidText.setText(`${playerBid} Gold`);
	}
	if (currentBidText) {
		currentBidText.setText(`${currentBid} Gold`);
	}
	if (bidButtonText) {
		bidButtonText.setText(`Press space to place bid ${playerBid} Gold`);
	}
	
	updateLeadingBidText();
}

// Timer management functions
function startAuctionTimer() {
	// Don't start timer if we're exiting
	if (isExitingAuction) return;
	
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
			// Stop the timer first
			auctionClubSound.play();
			stopAuctionTimer();

			if (lastBidder === 'player') {
				biddingWon();
			}
			// Show SOLD animation for 1 second, then determine winner
			showSoldAnimation(() => {
				// Fly out current artifact before determining winner
				flyOutArtifact(() => {
					resetAuctionForNextRound();
				});
			});
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
	const handY = Math.random() * 50 + 450; // Between 450 and 500 pixels down

	//handSprite = scene.add.image(randomX, handY, 'auqhand');
	handSprite.x = randomX;
	handSprite.y = handY;
	
	// Remove the hand after 1 second (1000 milliseconds)
	setTimeout(() => {
		if (handSprite && handSprite.scene) {
			handSprite.x = -100; // Move hand off-screen
			//handSprite.destroy(); // Todo: Flytta handen åt helvete
		}
	}, 1000);
}

function showSoldAnimation(callback) {
	// Only show SOLD if we're in bidding stage
	if (currentStage !== 'bidding') return;
	
	// Stop the current background animation
	if (auctionBackground) {
		auctionBackground.anims.stop();
		auctionBackground.setTexture('auqSOLD');
	}
	
	// Clear any existing sold animation timeout
	if (soldAnimationTimeout) {
		clearTimeout(soldAnimationTimeout);
	}
	
	// Show SOLD for 1 second, then call the callback
	soldAnimationTimeout = setTimeout(() => {
		soldAnimationTimeout = null;
		// Only execute callback if we're not exiting
		if (callback && !isExitingAuction) {
			callback();
		}
	}, 1000);
}

function updateLeadingBidText() {
	if (!leadingBidText) return;
	
	if (lastBidder === 'player') {
		leadingBidText.setText('You have the leading bid');
		leadingBidText.setFill('#ffffff'); 
	} else if (lastBidder === 'bot') {
		leadingBidText.setText('Another count has the leading bid');
		leadingBidText.setFill('#ffffff'); 
	} else {
		leadingBidText.setText('No bids yet');
		leadingBidText.setFill('#ffffff'); 
	}
}

// Artifact display functions
function getRandomArtifact() {
	const randomIndex = Math.floor(Math.random() * availableArtifacts.length);
	return availableArtifacts[randomIndex];
}

function flyInArtifact() {
	if (currentStage !== 'bidding') return;
	
	const scene = game.scene.scenes[0];
	const selectedArtifact = getRandomArtifact();
	
	// Create artifact sprite starting from left side of screen
	currentArtifactSprite = scene.add.image(-100, artifactDisplayPositionY, selectedArtifact);
	//currentArtifactSprite.setScale(1.5); // Make it prominent
	
	artifactAnimationState = 'flying_in';
	
	// Animate to display position
	scene.tweens.add({
		targets: currentArtifactSprite,
		x: artifactDisplayPositionX,
		duration: 1000, // 1 second to fly in
		ease: 'Power2',
		onComplete: () => {
			// Don't execute if we're exiting
			if (isExitingAuction) return;
			
			artifactAnimationState = 'displayed';
			// Start auction timer only after artifact is in position
			startAuctionTimer();
		}
	});
}

function flyOutArtifact(callback) {
	if (!currentArtifactSprite || currentStage !== 'bidding') {
		if (callback) callback();
		return;
	}
	
	const scene = game.scene.scenes[0];
	artifactAnimationState = 'flying_out';
	
	// Animate to right side of screen
	scene.tweens.add({
		targets: currentArtifactSprite,
		x: 900, // Off screen to the right
		duration: 1000, // 1 second to fly out
		ease: 'Power2',
		onComplete: () => {
			// Don't execute if we're exiting
			if (isExitingAuction) return;
			
			if (currentArtifactSprite) {
				currentArtifactSprite.destroy();
				currentArtifactSprite = null;
			}
			artifactAnimationState = 'none';
			// Start next artifact cycle
			if (currentStage === 'bidding') {
				flyInArtifact();
			}
			if (callback && !isExitingAuction) callback();
		}
	});
}

// Input Handler System
function setupInputHandlers(scene) {
	// Splash screen input handler
	inputHandlers.splash = {
		'SPACE': () => setGameStage('worldMap')
	};
	
	// WorldMap stage input handler
	inputHandlers.worldMap = {
		'UP': () => { navigateToLocation('prev'); startWalkAnimation(); },
		'DOWN': () => { navigateToLocation('next'); startWalkAnimation(); },
		'LEFT': () => { navigateToLocation('prev'); startWalkAnimation(); },
		'RIGHT': () => { navigateToLocation('next'); startWalkAnimation(); },
		'ENTER': () => { enterCurrentLocation(); }
	};
	
	// Bidding stage input handler
	inputHandlers.bidding = {
		'SPACE': () => placeBid(),
		'ENTER': () => placeBid(),
		'ESC': () => exitToWorldMap()
	};
	
	// Sidescroller stage input handler
	inputHandlers.sidescroller = {
		'SPACE': () => jump(),
		'UP': () => jump(),
		'ENTER': () => jump(),
		'ESC': () => exitToWorldMap()
	};

	// Giza stage input handler
	inputHandlers.giza = {
		'ESC': () => exitToWorldMap(),
		'LEFT': () => slideLeft(),
		'RIGHT': () => slideRight()
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
		
		// Handle arrow keys and WASD
		if (keyName === 'ArrowUp' || keyName === 'KeyW') keyName = 'UP';
		else if (keyName === 'ArrowDown' || keyName === 'KeyS') keyName = 'DOWN';
		else if (keyName === 'ArrowLeft' || keyName === 'KeyA') keyName = 'LEFT';
		else if (keyName === 'ArrowRight' || keyName === 'KeyD') keyName = 'RIGHT';
		
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
	if (stageName === 'splash') {
		setupSplashUI();
	} else if (stageName === 'worldMap') {
		setupWorldMapUI();
	} else if (stageName === 'bidding') {
		setupBiddingUI();
	} else if (stageName === 'sidescroller') {
		setupSidescrollerUI();
	} else if (stageName === 'giza') {
		setupGizaUI();
	}
}

function setupSplashUI() {
	// Clear existing elements
	clearUI();
	
	// Start splash music
	if (splashMusic && !splashMusic.isPlaying) {
		splashMusic.play();
	}
	
	const scene = game.scene.scenes[0];
	
	// Create splash animation if not already created
	if (!splashAnimationsCreated) {
		scene.anims.create({
			key: 'splash_blink',
			frames: [
				{ key: 'splash' },
				{ key: 'splashBlink' }
			],
			frameRate: 2, // Slow blink effect
			repeat: -1
		});
		splashAnimationsCreated = true;
	}
	
	// Create splash sprite centered on screen
	splashSprite = scene.add.sprite(400, 300, 'splash');
	splashSprite.setDisplaySize(800, 600); // Full screen
	splashSprite.anims.play('splash_blink', true);
	
	// Play syphilis sound when splash screen appears
	if (syphilisSound) {
		syphilisSound.play();
	}
}

function setupWorldMapUI() {
	// Stop splash music
	if (splashMusic && splashMusic.isPlaying) {
		splashMusic.stop();
	}
	
	// Clear existing elements
	clearUI();
	
	// Create worldMap background
	const scene = game.scene.scenes[0];
	const mapBackground = scene.add.image(400, 300, 'map');
	mapBackground.setDisplaySize(800, 600);
	
	// Create player with animation at first location
	const firstLocation = mapLocations[currentLocationIndex];
	greve = scene.add.sprite(firstLocation.x, firstLocation.y, 'droska1');
	
	// Create walking animation
	scene.anims.create({
		key: 'walk',
		frames: [
			{ key: 'droska1' },
			{ key: 'droska2' }
		],
		frameRate: 8,
		repeat: -1
	});
	
	// Create idle animation (just droska1)
	scene.anims.create({
		key: 'idle',
		frames: [{ key: 'droska1' }],
		frameRate: 1
	});
	
	// Instructions
	scene.add.text(50, 50, 'Use arrow keys to navigate, Enter to interact', {
		fontSize: '16px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	});
	
	// Location display
	const location = mapLocations[currentLocationIndex];
	
	// Wallet display (always visible)
	walletText = scene.add.text(650, 30, `Wallet: ${playerWallet} Gold`, {
		fontSize: '20px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	});
	
	// Start continuous walking animation
	greve.anims.play('walk', true);
	
	// Create HUD
	createHUD();
	
	// Start world map music
	if (worldMapMusic && !worldMapMusic.isPlaying) {
		worldMapMusic.play();
	}
	
	mimapElements = [greve, auctionZone, walletText];
}

let handSprite;

function setupBiddingUI() {
	// Stop world map music
	if (worldMapMusic && worldMapMusic.isPlaying) {
		worldMapMusic.stop();
	}
	
	// Start auction music
	if (auctionMusic && !auctionMusic.isPlaying) {
		auctionMusic.play();
	}
	
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
	walletText = scene.add.text(600, 30, `Wallet: ${playerWallet} Gold`, {
		fontSize: '24px',
		fill: '#ecf0f1',
		fontFamily: 'Arial'
	});
	
	// Initialize playerBid to be current bid + 10
	playerBid = currentBid + 10;
	
	// Start the artifact display cycle (this will start the auction timer when artifact is in position)
	flyInArtifact();
	
	// Update leading bid text initially
	updateLeadingBidText();

	// Current bid display (center)
	scene.add.text(450, 130, `Current Bid: `, {
		fontSize: '32px',
		fill: '#ecf0f1',
		fontFamily: 'Arial'
	}).setOrigin(0.5);

	currentBidText = scene.add.text(600, 130, `${currentBid} Gold`, {
		fontSize: '48px',
		fontSize: '32px',
		fill: '#ecf0f1',
		fontFamily: 'Arial'
	}).setOrigin(0.5);

	// Create the hand sprite
	handSprite = scene.add.image(-100, -100, 'auqhand');

	// Leading bid display
	leadingBidText = scene.add.text(400, 470, '', {
		fontSize: '20px',
		fill: '#f39c12',
		fontFamily: 'Arial',
		fontStyle: 'bold'
	}).setOrigin(0.5);

	// Place bid instruction (centered)
	bidButtonText = scene.add.text(400, 500, `Press space to place bid ${playerBid} Gold`, {
		fontSize: '20px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	}).setOrigin(0.5);
	
	// Exit instruction
	scene.add.text(50, 50, 'Press ESC to return to map', {
		fontSize: '16px',
		fill: '#ecf0f1',
		fontFamily: 'Arial'
	});
	
	// Create HUD
	createHUD();
}

function clearUI() {
	const scene = game.scene.scenes[0];
	scene.children.removeAll();
}

// HUD functions
function createHUD() {
	const scene = game.scene.scenes[0];
	
	// Gold display
	hudGoldText = scene.add.text(20, 20, `Gold: ${playerWallet}`, {
		fontSize: '18px',
		fill: '#FFD700',
		fontFamily: 'Arial',
		fontStyle: 'bold'
	});
	
	// Social Status bar background
	hudSocialStatusBackground = scene.add.rectangle(20, 50, 150, 20, 0x333333);
	hudSocialStatusBackground.setOrigin(0, 0);
	
	// Social Status bar
	hudSocialStatusBar = scene.add.rectangle(22, 52, 146, 16, 0x00ff00);
	hudSocialStatusBar.setOrigin(0, 0);
	
	// Social Status label
	scene.add.text(20, 75, 'Social Status', {
		fontSize: '12px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	});
	
	// Syphilis bar background
	hudSyphilisBackground = scene.add.rectangle(20, 95, 150, 20, 0x333333);
	hudSyphilisBackground.setOrigin(0, 0);
	
	// Syphilis bar
	hudSyphilisBar = scene.add.rectangle(22, 97, 1.46, 16, 0x00ff00);
	hudSyphilisBar.setOrigin(0, 0);
	
	// Syphilis label
	scene.add.text(20, 120, 'Syphilis', {
		fontSize: '12px',
		fill: '#ffffff',
		fontFamily: 'Arial'
	});
	
	// Initial update
	updateHUD();
}

function updateHUD() {
	if (!hudGoldText) return;
	
	// Update gold display
	hudGoldText.setText(`Gold: ${playerWallet}`);
	
	// Update social status bar
	const socialStatusPercent = Math.max(0, Math.min(100, socialStatus)) / 100;
	const socialStatusWidth = socialStatusPercent * 146;
	hudSocialStatusBar.width = socialStatusWidth;
	
	// Color social status bar: green when high, red when low
	const socialStatusColor = socialStatusPercent > 0.5 ? 
		Phaser.Display.Color.Interpolate.ColorWithColor(
			{r: 255, g: 255, b: 0}, // yellow
			{r: 0, g: 255, b: 0},   // green
			10,
			Math.floor((socialStatusPercent - 0.5) * 20)
		) :
		Phaser.Display.Color.Interpolate.ColorWithColor(
			{r: 255, g: 0, b: 0},   // red
			{r: 255, g: 255, b: 0}, // yellow
			10,
			Math.floor(socialStatusPercent * 20)
		);
	
	hudSocialStatusBar.setFillStyle(Phaser.Display.Color.GetColor(socialStatusColor.r, socialStatusColor.g, socialStatusColor.b));
	
	// Update syphilis bar
	const syphilisPercent = Math.max(0, Math.min(100, syphilis)) / 100;
	const syphilisWidth = syphilisPercent * 146;
	hudSyphilisBar.width = syphilisWidth;
	
	// Color syphilis bar: green when low, red when high (inverse of social status)
	const syphilisColor = syphilisPercent > 0.5 ? 
		Phaser.Display.Color.Interpolate.ColorWithColor(
			{r: 255, g: 255, b: 0}, // yellow
			{r: 255, g: 0, b: 0},   // red
			10,
			Math.floor((syphilisPercent - 0.5) * 20)
		) :
		Phaser.Display.Color.Interpolate.ColorWithColor(
			{r: 0, g: 255, b: 0},   // green
			{r: 255, g: 255, b: 0}, // yellow
			10,
			Math.floor((1 - syphilisPercent) * 20)
		);
	
	hudSyphilisBar.setFillStyle(Phaser.Display.Color.GetColor(syphilisColor.r, syphilisColor.g, syphilisColor.b));
}

// Sidescroller functions
function setupSidescrollerUI() {
	// Stop world map music
	if (worldMapMusic && worldMapMusic.isPlaying) {
		worldMapMusic.stop();
	}
	
	// Start sidescroller music
	if (sidescrollerMusic && !sidescrollerMusic.isPlaying) {
		sidescrollerMusic.play();
	}
	
	clearUI();
	const scene = game.scene.scenes[0];

	// Reset game state
	obstacles = [];
	isJumping = false;
	jumpVelocity = 0;
	obstacleSpawnTimer = 0;
	isGamePaused = false;
	pauseTimer = 0;
	isCollisionImmune = false;
	immunityTimer = 0;
	
	// Create background (simple color for now)
	scene.add.rectangle(400, 300, 800, 600, 0x87CEEB); // Sky blue
	
	// Create ground
	scene.add.rectangle(400, 550, 800, 100, 0x8B4513); // Brown ground
	
	// Create player using same sprite as worldMap
	sidescrollerPlayer = scene.add.sprite(100, groundY - 25, 'greve1');
	sidescrollerPlayer.setScale(1.5); // Make slightly larger
	
	// Create sidescroller-specific animations if not already created
	if (!sidescrollerAnimationsCreated) {
		// Create sidescroller walking animation with greve sequence
		scene.anims.create({
			key: 'sidescroller_walk',
			frames: [
				{ key: 'greve1' },
				{ key: 'greve2' },
				{ key: 'greve3' },
				{ key: 'greve2' }
			],
			frameRate: 18,
			repeat: -1
		});
		
		sidescrollerAnimationsCreated = true;
	}
	
	// Start with walking animation (auto-runner game)
	sidescrollerPlayer.anims.play('sidescroller_walk', true);
	
	// Create pesantShake animation if not already created
	if (!pesantShakeAnimationCreated) {
		scene.anims.create({
			key: 'pesantShake',
			frames: [
				{ key: 'greveSkak1' },
				{ key: 'greveSkak2' }
			],
			frameRate: 12,
			repeat: -1
		});
		pesantShakeAnimationCreated = true;
	}
	
	// Create bonde walking animation
	scene.anims.create({
		key: 'bonde',
		frames: [
			{ key: 'bonde1' },
			{ key: 'bonde2' }
		],
		frameRate: 6,
		repeat: -1
	});
	
	// Create bonde running animation
	scene.anims.create({
		key: 'bonde_run',
		frames: [
			{ key: 'bonde3' },
			{ key: 'bonde4' }
		],
		frameRate: 10,
		repeat: -1
	});
	
	// Instructions
	scene.add.text(50, 50, 'Press SPACE or UP to jump over obstacles', {
		fontSize: '16px',
		fill: '#000000',
		fontFamily: 'Arial'
	});
	
	// Exit instruction
	scene.add.text(50, 80, 'Press ESC to return to map', {
		fontSize: '16px',
		fill: '#000000',
		fontFamily: 'Arial'
	});
	
	// Wallet display
	walletText = scene.add.text(650, 30, `Wallet: ${playerWallet} Gold`, {
		fontSize: '20px',
		fill: '#000000',
		fontFamily: 'Arial'
	});
	
	// Create HUD
	createHUD();
}


// Giza functions
let greveOmNomSprite;

function setupGizaUI() {
	// Stop world map music
	if (worldMapMusic && worldMapMusic.isPlaying) {
		worldMapMusic.stop();
	}
	
	// Start Giza music
	if (gizaMusic && !gizaMusic.isPlaying) {
		gizaMusic.play();
	}

	clearUI();
	// no clue what this does but it happens everywhere so i guess it is needed here...
	const scene = game.scene.scenes[0];

	// Animated background
	auctionBackground = scene.add.sprite(400, 300, 'giza');
	auctionBackground.setDisplaySize(800, 600);

	// Create greveOmNom animation
	scene.anims.create({
		key: 'greveOmNom',
		frames: [
			{ key: 'greveNom' },
			{ key: 'greveOm' }
		],
		frameRate: 4,
		repeat: -1
	});

	// Create camel animation
	if (!gizaAnimationsCreated) {
		scene.anims.create({
			key: 'camel',
			frames: [
				{ key: 'camel1' },
				{ key: 'camel2' }
			],
			frameRate: 6,
			repeat: -1
		});
		gizaAnimationsCreated = true;
	}

	// Create greveOmNom sprite at bottom of screen
	greveOmNomSprite = scene.add.sprite(400, 550, 'greveNom');
	greveOmNomSprite.anims.play('greveOmNom', true);

	// Exit instruction
	scene.add.text(50, 80, 'Press ESC to return to map', {
		fontSize: '16px',
		fill: '#000000',
		fontFamily: 'Arial'
	});
	
	// Create HUD
	createHUD();

}

function spawnCamel() {
	const scene = game.scene.scenes[0];
	const randomX = Math.random() * 800; // Random x position across screen width
	
	const camel = scene.add.sprite(randomX, -50, 'camel1'); // Start above screen
	camel.anims.play('camel', true);
	camel.objectType = 'camel';
	camel.fallSpeed = 3 + Math.random() * 2; // Random speed between 3-5
	
	gizaFallingObjects.push(camel);
}

function spawnMummy() {
	const scene = game.scene.scenes[0];
	const randomX = Math.random() * 800; // Random x position across screen width
	
	const mummy = scene.add.sprite(randomX, -50, 'mummy'); // Start above screen
	mummy.objectType = 'mummy';
	mummy.fallSpeed = 2 + Math.random() * 2; // Random speed between 2-4
	
	gizaFallingObjects.push(mummy);
}

function checkGizaCollision(player, object) {
	const playerBounds = player.getBounds();
	const objectBounds = object.getBounds();
	
	return Phaser.Geom.Rectangle.Overlaps(playerBounds, objectBounds);
}

let isPesantInGame = false;

function jump() {
	if (!isJumping && sidescrollerPlayer) {
		isJumping = true;
		jumpVelocity = -20; // Negative for upward movement
	}
}

function slideLeft() {
	// Should move greveOnNom to the left
	greveOmNomSprite.x -= greveOmNomSprite.x < 0 ? 0 : 10;
	console.log('left');
}

function slideRight() {
	// Should move greveOnNom to the right
	greveOmNomSprite.x += greveOmNomSprite.x > 800 ? 0 : 10;
	console.log('right');
}

let isFirstRun = true;

function updateSidescroller() {
	if (isFirstRun) {
		isFirstRun = false;
		jump();
	}
	if (currentStage !== 'sidescroller' || !sidescrollerPlayer) return;
	
	const scene = game.scene.scenes[0];
	
	// Handle pause timer for pesantShake sequence
	if (isGamePaused) {
		pauseTimer--;
		if (!flaxxxSound.isPlaying) {
			flaxxxSound.play();
		}
		if (pauseTimer <= 0) {
			flaxxxSound.stop();
			// Resume game after 3 seconds (180 frames at 60fps)
			endPesantShakeSequence();
		}
		return; // Don't update game logic while paused
	}
	
	// Handle collision immunity timer
	if (isCollisionImmune) {
		immunityTimer--;
		if (immunityTimer <= 0) {
			isCollisionImmune = false;
		}
	}
	
	// Handle jumping physics
	if (isJumping) {
		sidescrollerPlayer.y += jumpVelocity;
		jumpVelocity += gravity;
		
		// Check if landed
		if (sidescrollerPlayer.y >= groundY - 45) {
			sidescrollerPlayer.y = groundY - 45;
			isJumping = false;
			jumpVelocity = 0;
		}
	}
	
	// Spawn obstacles
	obstacleSpawnTimer++;
	if (obstacleSpawnTimer > 120) { // Every 2 seconds at 60fps
		spawnObstacle(scene);
		obstacleSpawnTimer = 0;
	}

	if (obstacleSpawnTimer === 80 && !isPesantInGame) { // Every 2 seconds at 60fps
		spawnPesant(scene);
		isPesantInGame = true;
	}
	
	// Move and check obstacles
	for (let i = obstacles.length - 1; i >= 0; i--) {
		const obstacle = obstacles[i];
		
		// Handle peasant behavior
		if (obstacle.obstacleType === 'pesant') {
			obstacle.spawnTime++;
			
			// Start running after 2 seconds (120 frames at 60fps)
			if (obstacle.spawnTime > 40 && !obstacle.isRunning) {
				obstacle.isRunning = true;
				obstacle.anims.play('bonde_run', true);
			}
			
			// Handle peasant jumping over hay obstacles
			if (obstacle.isRunning && !obstacle.isJumping) {
				// Check for nearby hay obstacles to jump over
				for (let hayObstacle of obstacles) {
					if (hayObstacle.obstacleType === 'haystack') {
						const distance = hayObstacle.x - obstacle.x;
						// Jump when hay is about 80-100 pixels ahead
						if (distance > 80 && distance < 100) {
							obstacle.isJumping = true;
							obstacle.jumpVelocity = -12;
							break;
						}
					}
				}
			}
			
			// Handle peasant jumping physics
			if (obstacle.isJumping) {
				obstacle.y += obstacle.jumpVelocity;
				obstacle.jumpVelocity += gravity;
				
				// Check if landed
				if (obstacle.y >= groundY - 15) {
					obstacle.y = groundY - 15;
					obstacle.isJumping = false;
					obstacle.jumpVelocity = -10; // Reset jump velocity
				}
			}
			
			// Move peasant (slower when running)
			if (obstacle.isRunning) {
				obstacle.x -= obstacle.runSpeed;
			} else {
				obstacle.x -= gameSpeed;
			}
		} else {
			// Regular obstacle movement
			obstacle.x -= gameSpeed;
		}
		
		// Remove obstacles that are off screen
		if (obstacle.x < -50) {
			obstacle.destroy();
			obstacles.splice(i, 1);
		}
		
		// Check collision with player
		else if (checkCollision(sidescrollerPlayer, obstacle)) {
			if (obstacle.obstacleType === 'haystack' && !isCollisionImmune) {
				// Return to map - game over
				isPesantInGame = false;
				isFirstRun = true;
				exitToWorldMap();
			} else if (obstacle.obstacleType === 'pesant') {
				isPesantInGame = false;
				// Reset player to ground level (even if jumping)
				sidescrollerPlayer.y = groundY - 45;
				isJumping = false;
				jumpVelocity = 0;
				// Set collision immunity for 1 second (60 frames at 60fps)
				isCollisionImmune = true;
				immunityTimer = 60;
				// Start pesantShake sequence
				startPesantShakeSequence();
				// Remove the pesant
				obstacle.destroy();
				obstacles.splice(i, 1);
			}
		}
	}
}

function updateGiza() {
	if (currentStage !== 'giza' || !greveOmNomSprite) return;
	
	// Spawn objects at random intervals
	gizaSpawnTimer++;
	if (gizaSpawnTimer > 90 + Math.random() * 120) { // Random spawn between 1.5-3.5 seconds at 60fps
		// Randomly spawn either camel or mummy
		if (Math.random() < 0.6) { // 60% chance for camel (obstacle)
			spawnCamel();
		} else { // 40% chance for mummy (collectible)
			spawnMummy();
		}
		gizaSpawnTimer = 0;
	}
	
	// Update falling objects
	for (let i = gizaFallingObjects.length - 1; i >= 0; i--) {
		const object = gizaFallingObjects[i];
		
		// Move object down
		object.y += object.fallSpeed;
		
		// Check collision with player
		if (checkGizaCollision(greveOmNomSprite, object)) {
			if (object.objectType === 'camel') {
				camelCrushSound.play(); // Play camel crush sound
				exitToWorldMap(); 
				console.log('-1'); // Collision with camel (bad)
			} else if (object.objectType === 'mummy') {
				mummyMunchSound.play(); // Play mummy munch sound
				syphilis -= 20;
				console.log('+1'); // Collision with mummy (good)
			}
			
			// Remove the object after collision
			object.destroy();
			gizaFallingObjects.splice(i, 1);
		}
		// Remove objects that have fallen off screen
		else if (object.y > 650) {
			object.destroy();
			gizaFallingObjects.splice(i, 1);
		}
	}
}

function spawnObstacle(scene) {
	// Create a hay obstacle
	const obstacle = scene.add.image(Math.random() * 300 + 800, groundY - 15, 'hay');
	obstacle.setScale(1.0); // Adjust size as needed
	obstacle.obstacleType = 'haystack'; // Mark as haystack obstacle
	obstacles.push(obstacle);
}

function spawnPesant(scene) {
	// Create an animated bonde peasant
	const pesant = scene.add.sprite(Math.random() * 300 + 800, groundY - 15, 'bonde1');
	pesant.setScale(1.2); // Make slightly larger
	pesant.anims.play('bonde', true); // Start bonde walking animation
	pesant.jumpVelocity = -10;
	pesant.obstacleType = 'pesant'; // Mark as pesant obstacle
	
	// Add running behavior properties
	pesant.spawnTime = 0; // Track how long peasant has existed
	pesant.isRunning = false;
	pesant.runSpeed = gameSpeed - 7; // Slightly faster than player (moves left slower than hay)
	pesant.isJumping = false;
	pesant.jumpTimer = 0;
	
	obstacles.push(pesant);
}

function checkCollision(player, obstacle) {
	const playerBounds = player.getBounds();
	const obstacleBounds = obstacle.getBounds();
	
	return Phaser.Geom.Rectangle.Overlaps(playerBounds, obstacleBounds);
}

function startPesantShakeSequence() {
	if (!sidescrollerPlayer) return;
	
	// Pause the game
	isGamePaused = true;
	pauseTimer = 180; // 3 seconds at 60fps
	
	// Immediately stop current animation and start pesantShake animation
	sidescrollerPlayer.anims.stop();
	sidescrollerPlayer.anims.play('pesantShake', true);
}

function endPesantShakeSequence() {
	if (!sidescrollerPlayer) return;

	playerWallet += Math.floor(Math.random() * 15 + 5); // Random between 5 Gold and 20 Gold
	walletText.setText(`Wallet: ${playerWallet} Gold`);

	// Resume the game
	isGamePaused = false;
	pauseTimer = 0;
	
	// Return to walking animation (always running)
	sidescrollerPlayer.anims.stop();
	sidescrollerPlayer.anims.play('sidescroller_walk', true);
}

// WorldMap functions
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
	}
}

function navigateToLocation(direction) {
	if (!greve || mapLocations.length === 0) return;
	
	// Calculate new location index
	let newIndex = currentLocationIndex;
	
	if (direction === 'next') {
		newIndex = (currentLocationIndex + 1) % mapLocations.length;
	} else if (direction === 'prev') {
		newIndex = (currentLocationIndex - 1 + mapLocations.length) % mapLocations.length;
	}
	
	// Update current location
	currentLocationIndex = newIndex;
	const location = mapLocations[currentLocationIndex];
	
	// Move player to new location
	greve.x = location.x;
	greve.y = location.y;
	
	// Play walking animation
	if (greve.anims) {
		greve.anims.play('walk', true);
	}
	
	// Update location display
	updateLocationDisplay();
}

function updateLocationDisplay() {
	// This will show which location the player is currently at
	const location = mapLocations[currentLocationIndex];
	console.log(`Current location: ${location.name}`);
}

function enterCurrentLocation() {
	const location = mapLocations[currentLocationIndex];
	console.log(`Entering ${location.name}`);
	
	// Enter the minigame for this location
	if (location.minigame === 'bidding') {
		setGameStage('bidding');
	} else if (location.minigame === 'sidescroller') {
		setGameStage('sidescroller');
	} else if (location.minigame === 'giza') {
		setGameStage('giza');
	}
	// Add more minigame types as needed
}



function exitToWorldMap() {
	// Stop sidescroller music
	if (sidescrollerMusic && sidescrollerMusic.isPlaying) {
		sidescrollerMusic.stop();
	}
	
	// Stop Giza music
	if (gizaMusic && gizaMusic.isPlaying) {
		gizaMusic.stop();
	}
	
	// Stop auction music
	if (auctionMusic && auctionMusic.isPlaying) {
		auctionMusic.stop();
	}
	
	isFirstRun = true;
	isPesantInGame = false;
	resetAuction();
	setGameStage('worldMap');
}

function resetAuction() {
	// Set exit flag to prevent callbacks from executing
	isExitingAuction = true;
	
	stopAuctionTimer();
	
	// Clear sold animation timeout
	if (soldAnimationTimeout) {
		clearTimeout(soldAnimationTimeout);
		soldAnimationTimeout = null;
	}
	
	// Stop any running Phaser tweens on artifacts
	const scene = game.scene.scenes[0];
	if (scene && scene.tweens) {
		scene.tweens.killAll();
	}
	
	currentBid = 10;
	playerBid = 20; // Will be updated to currentBid + 10 when auction starts
	bidWinningProbability = 1;
	auctionTimer = 5;
	auctionTimerText;
	timerInterval;
	lastBidder = null; // 'player' or 'bot'
	
	// Clean up artifact system
	if (currentArtifactSprite) {
		currentArtifactSprite.destroy();
		currentArtifactSprite = null;
	}
	artifactAnimationState = 'none';
	
	// Reset exit flag
	isExitingAuction = false;
}

// Animation helper functions
let walkingTimeout;

function startWalkAnimation() {
	// Keep the walking animation running continuously
	if (greve && greve.anims) {
		greve.anims.play('walk', true);
	}
}
