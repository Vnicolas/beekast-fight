const express = require('express');
const app = express();
const server = app.listen(3000);
const io = require('socket.io')(server);

const MIN_TIMER = 2;
const MAX_TIMER = 6;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let firstPlayerConnected = false;
let lastPlayerConnected = false;
let firstPlayerReady = false;
let lastPlayerReady = false;
let signalShown = false;
let fighterHasAttacked = false;

function generateTimer() {
    return Math.floor(Math.random() * (MAX_TIMER - MIN_TIMER + 1) + MIN_TIMER) * 1000;
}

io.on('connection', (socket) => {
    if (firstPlayerConnected === false) {
        firstPlayerConnected = true;
        socket.player = 1;
        io.to(`${socket.id}`).emit('firstPlayer');
    } else {
        lastPlayerConnected = true;
        socket.player = 2;
        io.to(`${socket.id}`).emit('lastPlayer');
    }
    socket.join('players room');

    socket.on('disconnect', () => {
        if (socket.player === 1) {
            firstPlayerConnected = false;
            firstPlayerReady = false;
        } else {
            lastPlayerConnected = false;
            lastPlayerReady = false;
        }
    });

    socket.on('ready', () => {
        if (socket.player === 1) {
            firstPlayerReady = true;
        } else if (socket.player === 2){
            lastPlayerReady = true;
        }
        if (firstPlayerReady && lastPlayerReady) {
            fighterHasAttacked = false;
            signalShown = false;
            io.in('players room').emit('game-ready');
            setTimeout(() => {
                if (signalShown === false) {
                    io.in('players room').emit('signal');
                    signalShown = true;
                }
            }, generateTimer());
        }
    });

    socket.on('attack', () => {
        if (fighterHasAttacked === false && signalShown === false) {
            io.to(`${socket.id}`).emit('looser');
            const winner = (socket.player === 1) ? 2 : 1;
            io.in('players room').emit('endGame', winner);
            socket.to('players room').emit('winner');
        } else {
            const winner = socket.player;
            io.in('players room').emit('endGame', winner);
            io.to(`${socket.id}`).emit('winner');
            socket.to('players room').emit('looser');
            signalShown = false;
        }
        fighterHasAttacked = true;
        firstPlayerReady = false;
        lastPlayerReady = false;
    });
});
