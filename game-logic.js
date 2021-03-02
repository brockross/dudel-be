// set up all the game logic listeners on the socket
const { serverEvents, clientEvents } = require("./constants");

// examples of room-based socket server code has been really scant online. The examples I found both followed a pattern (one that I think is really dumb) where they wrote all the socket listeners inside the main io.on("connection") handler, and in EACH socket listener, they would check what room the socket is in, and direct all the handler logic at that room. It seems insane to write dozens of functions and have the first several lines of each one be "okay what is the context of this function?" The approach I'm pursuing here is to write the functions within the context to which they belong, so the association between the two is implicit.
const jackInToMatrix = (socket, Game) => {
  const { id: sid } = socket;
  const { state, toGame } = Game;

  // *** LOBBY HANDLING ***
  socket.on("add-user", (data) => {
    const { username } = data;
    state.players[sid].username = username;

    console.log(
      `user ${data.username} added username in game ${
        Game.gameCode
      }. Player list is now ${Object.keys(state.players)
        .map((k) => state.players[k].username || "no username")
        .join(", ")}`
    );

    toGame(serverEvents.userAdded, { username });
  });

  // *** GAMEPLAY ***
};

module.exports = {
  jackInToMatrix,
};
