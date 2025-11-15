// --- DOM Elements ---
const scoreElement = document.getElementById('score');
const missedCountElement = document.getElementById('missedCount');
const gameArea = document.getElementById('gameArea');
const gameOverModal = document.getElementById('gameOverModal');
const initialOverlay = document.getElementById('initialOverlay'); 
const finalScoreElement = document.getElementById('finalScore');
const startButton = document.getElementById('startButton'); 
const initialStartButton = document.getElementById('initialStartButton'); 
const catcher = document.getElementById('catcher');
const gameOverSound = document.getElementById('gameOverSound'); 

// --- Game State Variables ---
let score = 0;
let missedCount = 0; 
const MAX_MISSED = 5; // Game over after 5 missed fruits
let isGameOver = true;
// ... (Keep other constant definitions like FRUIT_TYPES, GAME_WIDTH/HEIGHT etc.) ...
const FRUIT_TYPES = ['🍎', '🍌', '🍓', '🍇', '🍉', '🍑', '🍒', '🍍'];
const GAME_WIDTH = 400; 
const GAME_HEIGHT = 560; 
const FRUIT_SIZE = 40; 
const CATCHER_WIDTH = 80;
const CATCHER_HEIGHT = 50;
let fruitFallSpeed = 5; 
let fruitGeneratorIntervalId;
let audioInitialized = false; 

// --- Sound Initialization (Fix for browser autoplay policy) ---
function initializeAudioAndStartGame() {
    if (!audioInitialized) {
        // This play/pause unlocks the browser's audio context using the user's click
        gameOverSound.play();
        gameOverSound.pause();
        audioInitialized = true;
    }
    startGame();
}

// --- Scoreboard and State Management ---
function updateScore(points) {
    score += points;
    // Ensure score never goes below zero
    if (score < 0) {
        score = 0;
    }
    scoreElement.textContent = score;

    // Check if scoring 0 points results in game over
    if (score === 0 && missedCount > 0) { // If we have missed fruits and score is zero
         endGame();
    }
    
    // Increase speed every 10 points gained (only positive points)
    if (points > 0 && score > 0 && score % 10 === 0) {
        increaseGameSpeed();
    }
}

function handleMissedFruit() {
    missedCount++;
    missedCountElement.textContent = missedCount;

    // Deduct a point, but updateScore function handles keeping it non-negative
    updateScore(-1); 
    
    // Game over condition 1: 5 missed fruits
    if (missedCount >= MAX_MISSED) {
        endGame();
    }
    // Game over condition 2 handled in updateScore: Score reaching 0 points
}

function increaseGameSpeed() {
    fruitFallSpeed += 0.5; 
}

// --- Catcher Movement Logic ---
function moveCatcher(event) {
    let newX = event.clientX - gameArea.getBoundingClientRect().left - CATCHER_WIDTH / 2;
    if (newX < 0) newX = 0;
    if (newX > GAME_WIDTH - CATCHER_WIDTH) newX = GAME_WIDTH - CATCHER_WIDTH;
    catcher.style.left = newX + 'px';
}

// --- Fruit Logic ---
function createFruit() {
    if (isGameOver) return;
    const fruit = document.createElement('div');
    fruit.classList.add('fruit');
    fruit.textContent = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
    fruit.style.left = Math.random() * (GAME_WIDTH - FRUIT_SIZE) + 'px';
    fruit.style.top = '0px'; 
    gameArea.appendChild(fruit);
    makeFruitFall(fruit);
}

function makeFruitFall(fruit) {
    const fallInterval = setInterval(() => {
        if (isGameOver || !fruit.parentElement) {
            clearInterval(fallInterval);
            return;
        }
        
        let currentTop = parseInt(fruit.style.top, 10);
        let fruitLeft = parseInt(fruit.style.left, 10);
        let catcherLeft = parseInt(catcher.style.left, 10);

        // Check for collision with the catcher
        const isTouchingCatcher = 
            currentTop >= (GAME_HEIGHT - CATCHER_HEIGHT) &&
            fruitLeft > catcherLeft - (FRUIT_SIZE * 0.75) && 
            fruitLeft < catcherLeft + CATCHER_WIDTH - (FRUIT_SIZE * 0.25); 

        if (isTouchingCatcher) {
            clearInterval(fallInterval);
            fruit.remove();
            updateScore(1); // +1 score for catch
        } else if (currentTop >= GAME_HEIGHT) { 
            clearInterval(fallInterval);
            fruit.remove();
            handleMissedFruit(); 
        } else {
            fruit.style.top = currentTop + fruitFallSpeed + 'px'; 
        }
    }, 30); 
}

// --- Game Management ---

function startGame() {
    initialOverlay.style.display = 'none'; 
    gameOverModal.style.display = 'none'; 

    score = 0;
    missedCount = 0;
    isGameOver = false;
    fruitFallSpeed = 5; 

    scoreElement.textContent = score;
    missedCountElement.textContent = missedCount;
    
    gameArea.querySelectorAll('.fruit').forEach(f => f.remove());
    
    if (!document.getElementById('catcher')) {
         gameArea.appendChild(catcher); 
    }
    catcher.style.left = (GAME_WIDTH / 2) - (CATCHER_WIDTH / 2) + 'px';

    clearInterval(fruitGeneratorIntervalId); 
    fruitGeneratorIntervalId = setInterval(createFruit, 1000); 
    gameArea.addEventListener('mousemove', moveCatcher);
}

function endGame() {
    // Stop the game only if it hasn't already been stopped by the other condition
    if (isGameOver) return; 
    
    isGameOver = true;
    clearInterval(fruitGeneratorIntervalId); 
    gameArea.removeEventListener('mousemove', moveCatcher);
    
    finalScoreElement.textContent = score;
    gameOverModal.style.display = 'block'; // Show restart button/sticker

    // Play the game over sound
    if (audioInitialized) {
        gameOverSound.currentTime = 0; 
        gameOverSound.play().catch(e => console.error("Sound play failed:", e)); 
    }
}

// --- Event Listeners and Initialization ---

initialStartButton.addEventListener('click', initializeAudioAndStartGame);

startButton.addEventListener('click', startGame);

// Initialize the display on page load to show the initial overlay screen
window.onload = () => {
    initialOverlay.style.display = 'flex'; 
    scoreElement.textContent = 0;
    missedCountElement.textContent = 0;
};
