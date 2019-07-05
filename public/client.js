// Variables initialization
const socket = io('http://localhost:8888');
let player = 1;
let gameIsReady = false;
let gameIsStarted = false;
let signalShown = false;

// HTML elements
const btnJoin = document.querySelector('#join-button');
const header = document.querySelector('header span');
const sayan = document.querySelector('#fighter-1');
const sayanIndicator = document.querySelector('.icon-fighter.sayan');
const ennemy = document.querySelector('#fighter-2');
const ennemyIndicator = document.querySelector('.icon-fighter.ennemy');
const container = document.querySelector('.game-container');
const signal = document.querySelector('#signal');
const winnerMessage = document.querySelector('#winnerMessage');
const btnRestart = document.querySelector('#restart');

// Socket events
socket.on('game-ready', () => {
    launchGame();
});
socket.on('firstPlayer', () => {
    sayanIndicator.classList.add('blink-opacity');
    sayanIndicator.classList.remove('hidden');
    ennemyIndicator.classList.add('hidden');
});
socket.on('lastPlayer', () => {
    player = 2;
    sayanIndicator.classList.add('hidden');
    ennemyIndicator.classList.add('blink-opacity');
    ennemyIndicator.classList.remove('hidden');
});
socket.on('endGame', animateFighter);
socket.on('signal', showSignal);

btnJoin.addEventListener('click', joinBattle);

// Functions
function animateFighter(winner) {
    document.removeEventListener('keyup', attack);
    container.classList.remove('focus');
    hideSignal();
    container.style.animation = 'blink-opacity .5s linear';
    if (winner === 1) {
        sayan.style.backgroundPosition = '252% 13.5%';
        sayan.style.left = '50%';
        ennemy.style.backgroundPosition = '53% 153.1%';
        setTimeout(() => {
            sayan.style.backgroundPosition = '23.5% 0.1%';
            container.removeAttribute('style');
        }, 800);
    } else {
        ennemy.style.backgroundPosition = '-100% 15.9%';
        ennemy.style.left = '46%';
        sayan.style.backgroundPosition = '146% 20%';
        setTimeout(() => {
            ennemy.style.backgroundPosition = '31% 26.1%';
            container.removeAttribute('style');
        }, 800);
    }

    setTimeout(() => {
        if (winner === 1) {
            winnerMessage.innerHTML = 'PLAYER 1 WIN !';
            winnerMessage.classList.remove('hidden');
        } else {
            winnerMessage.innerHTML = 'PLAYER 2 WIN !';
        }
        winnerMessage.classList.remove('hidden');
        btnRestart.classList.remove('hidden');
    }, 500);
}

function showSignal() {
    signalShown = true;
    signal.style.visibility = 'visible';
}

function hideSignal() {
    signalShown = false;
    signal.style.visibility = 'hidden';
}

function attack() {
    socket.emit('attack');
}

function launchGame() {
    gameIsReady = true;
    header.classList.add('hidden');
    container.classList.add('focus');
    hideButton();
    prepareFighters();
    document.addEventListener('keyup', attack);
}

function hideButton () {
    btnJoin.classList.add('hidden');
}

function showButton () {
    btnJoin.classList.remove('hidden');
}

function joinBattle () {
    hideButton();
    waitOpponent();
    socket.emit('ready', player);
}

function waitOpponent() {
    gameIsReady = false;
    signalShown = false;
    hideSignal();
    hideButton();
    header.classList.remove('hidden');
    container.classList.remove('focus');
    header.classList.add('blink-opacity');
    header.classList.remove('blink-border');
    header.innerHTML = 'AWAITING THE OPPONENT...';
    sayan.removeAttribute('style');
    ennemy.removeAttribute('style');
    if (player === 1) {
        sayanIndicator.classList.remove('blink-opacity');
    } else {
        ennemyIndicator.classList.remove('blink-opacity');
    }

}

function reset() {
    location.reload();
}

function prepareFighters() {
    sayan.style.backgroundPosition = '70.5% 0%';
    ennemy.style.backgroundPosition = '0% 0%';
}
