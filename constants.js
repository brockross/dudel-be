// list of all events that can be sent from server to client. Comment denotes meaning of event
const serverEvents = {
  // from server (.emit)
  info: "info", // send general info to client
  playerJoin: "player-joined", // signal to client that another player has joined lobby via a game code
  userAdded: "user-added", // signal to clients that a lobby player added themselves to the game with a username
  gameStart: "game-start", // signal to clients that the game is beginning
};

// list of all events that can be sent from client to server. Comment denotes meaning of event
// events prefixed with "fetch" constitute a REST-like interaction using socketio's Ack API--rather than using separate client/server events to emit a request and a response
const clientEvents = {
  createGame: "create-game",
  joinGame: "join-game",
  fetchPlayerList: "fetch-player-list", // GET list of players
  addUser: "add-user", // player in lobby added themselves to game with a username
  allReady: "all-ready", // all players have joined lobby--ready to start game
  fetchInitialPrompt: "fetch-initial-prompt", // client has mounted the initial gameplay screen and is asking for first prompt
};

const PROMPTS_LIST = [
  "dog octopus",
  "log flume",
  "football club",
  "spaghetti helicoper",
  "hot dog",
  "crystal powers",
  "sleeping kitty",
  "gym socks",
  "HELL",
  "jumping jellyfish",
  "leaping lemur",
  "giraffe drummer",
];

module.exports = {
  serverEvents,
  clientEvents,
  PROMPTS_LIST,
};
