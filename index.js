const app = require("express")();
const httpServer = require("http").createServer(app);
const cors = require("cors");
app.use(cors);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET"],
  },
});

const { generateGameCode } = require("./helpers");
const { Game } = require("./game");
const { serverEvents, clientEvents } = require("./constants");

// ***** STATE *****
const activeGames = {};

io.on("connection", (socket) => {
  console.log(`somebody connected!`);
  socket.emit(serverEvents.info, "hey buddy");

  // ***** PRE-GAME SETUP *****
  socket.on(clientEvents.createGame, () => {
    const gameCode = generateGameCode();
    console.log(`initializing game with code ${gameCode}...`);

    socket.join(gameCode); // join room with game code (to enable room-based event emission)
    const newGame = new Game({ socket, io }, gameCode); // init game object with code, giving it context
    newGame.addPlayer(socket, { isFounder: true }); // join game as founding player
    activeGames[gameCode] = newGame; // add Game to activeGames so it can be joined/stopped/otherwise referenced
    socket.emit(serverEvents.createGameSuccess, "testy");
  });

  socket.on(clientEvents.joinGame, ({ gameCode }) => {
    console.log(`joining room with code ${gameCode}`);

    const gameToJoin = activeGames[gameCode];
    if (!!gameToJoin) {
      socket.join(gameCode); // join room
      gameToJoin.addPlayer(socket);
      socket.emit(serverEvents.joinGameSuccess);
    }
  });
});

httpServer.listen(1337, () => {
  console.log("server listening...");
});
