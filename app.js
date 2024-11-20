const express = require('express');
const app = express();
const server = app.listen(8080);
const io = require('socket.io')(server);
import GameService from './game.service';

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

const gameService = new GameService(io);

io.on('connection', socket => {
  if (gameService.gameIsFull) {
    return;
  }

  gameService.setPlayer(socket);

  socket.on('disconnect', () => {
    gameService.resetPlayer(socket);
  });

  socket.on('ready', () => {
    gameService.preparePlayer(socket);
    if (gameService.playersReady) {
      gameService.prepareGame();
      gameService.launchGame();
    }
  });

  socket.on('attack', timeToAttack => {
    if (gameService.playerHasAttacked) {
      return;
    }
    gameService.attack();
    let winner;
    if (!gameService.signalShown) {
      winner = socket.player === 1 ? 2 : 1;
    } else {
      winner = socket.player;
    }
    gameService.end(winner, timeToAttack);
  });
});
