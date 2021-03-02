const { serverEvents, clientEvents } = require("./constants");
const { jackInToMatrix } = require("./game-logic");

class Game {
  constructor({ io }, gameCode) {
    this.gameCode = gameCode;
    this.state = {
      players: {},
    };

    this.toGame = function (event, data) {
      // wrapper for io's "room" api--keeps game actions scoped to this game's clients
      io.to(gameCode).emit(event, data);
    };
  }

  addPlayer(socket, opts) {
    this.state.players[socket.id] = {
      socket,
      isFounder: opts?.isFounder,
      username: "",
    };

    jackInToMatrix(socket, this); // attach all game logic event listeners to socket when they join game

    this.toGame(
      serverEvents.info,
      `player joined game ${this.gameCode} with socket id ${socket.id}`
    );
    this.toGame(serverEvents.playerJoin, null); // TODO: use this to signal to lobby clients that an as-yet-unnamed player has connected
  }
}
module.exports = {
  Game,
};
