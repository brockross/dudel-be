// list of all events that can be sent from server to client. Comment denotes meaning of event
const serverEvents = {
  // from server (.emit)
  info: "info", // send general info to client
  createGameSuccess: "create-game-success", // tell client they've successfully initialized a new game lobby
  joinGameSuccess: "join-game-success", // tell client they've successfully joined an existing game lobby
  playerJoin: "player-joined", // signal to client that another player has joined lobby via a game code
  userAdded: "user-added", // signal to clients that a lobby player added themselves to the game with a username
};

// list of all events that can be sent from client to server. Comment denotes meaning of event
const clientEvents = {
  createGame: "create-game",
  joinGame: "join-game",
  addUser: "add-user", // player in lobby added themselves to game with a username
  allReady: "all-ready", // all players have joined lobby--ready to start game
};

module.exports = {
  serverEvents,
  clientEvents,
};