// set up all the game logic listeners on the socket
const { serverEvents, clientEvents } = require("./constants");

const jackInToMatrix = (socket, Game) => {
  const { id: sid } = socket;
  const { state, toGame } = Game;

  // *** UTILS ***
  // const toGame = (event, data) => {
  //   // wrapper for io's "room" api--keeps game actions scoped to this game's clients
  //   io.to(Game.gameCode).emit(event, data);
  // };

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
