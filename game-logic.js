// set up all the game logic listeners on the socket
const { serverEvents, clientEvents } = require("./constants");
const { getPlayerListForClient } = require("./helpers");

// examples of room-based socket server code has been really scant online. The examples I found both followed a pattern (one that I think is really dumb) where they wrote all the socket listeners inside the main io.on("connection") handler, and in EACH socket listener, they would check what room the socket is in, and direct all the handler logic at that room. It seems insane to write dozens of functions and have the first several lines of each one be "okay what is the context of this function?" The approach I'm pursuing here is to write the functions within the context to which they belong, so the association between the two is implicit.
const jackInToMatrix = (socket, Game) => {
  const { id: sid } = socket;
  const { state, toGame } = Game;

  // *** LOBBY HANDLING ***
  socket.on(clientEvents.addUser, (data) => {
    const { username } = data;
    state.players.get(sid).username = username;

    const players = getPlayerListForClient(Game);
    toGame(serverEvents.info, `${username} is ready to play!`);
    toGame(serverEvents.userAdded, players);
  });

  socket.on(clientEvents.fetchPlayerList, (cb) => {
    cb(getPlayerListForClient(Game));
  });

  // *** GAME INIT ***
  socket.on(clientEvents.allReady, () => {
    // init game state:
    // - sketchbooks
    // - player order
    // - # of rounds
    // once all is set up, broadcast event to start game
    toGame(serverEvents.gameStart);
  });

  // *** GAMEPLAY ***
};

module.exports = {
  jackInToMatrix,
};
