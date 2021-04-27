// set up all the game logic listeners on the socket
const _ = require("lodash");
const { serverEvents, clientEvents } = require("./constants");
const {
  getPlayerListForClient,
  getInitialPrompt,
  getShuffledPlayerList,
  initSubmissionTracking,
  isFinalSubmission,
  resetForNextRound,
  getHeldSketchbook,
  formatSubmission,
  buildAllSketchbooks,
} = require("./helpers");

// examples of room-based socket server code has been really scant online. The examples I found both followed a pattern (one that I think is really dumb) where they wrote all the socket listeners inside the main io.on("connection") handler, and in EACH socket listener, they would check what room the socket is in, and direct all the handler logic at that room. It seems insane to write dozens of functions and have the first several lines of each one be "okay what is the context of this function?" The approach I'm pursuing here is to write the functions within the context to which they belong, so the association between the two is implicit.
const jackInToMatrix = (socket, Game) => {
  const { id: sid } = socket;
  const { state, toGame } = Game;
  const thisPlayer = state.players.get(socket.id);

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
    // - sketchbooks & initial prompt
    for (let player of state.players.values()) {
      player.sketchbook = [];
      player.sketchbook.push({
        type: "guess",
        guess: getInitialPrompt(),
        author: "dudel-game-init",
      });
      player.heldSketchbook = player.sketchbook; // each player starts off holding their own sketchbook
    }

    // - player order
    state.playerOrder = getShuffledPlayerList(state.players);

    // - # of rounds
    state.currentRound = 1;
    state.numOfRounds = state.playerOrder.length;
    state.roundType = "doodle";

    // submission tracking init
    state.submissionTracking = initSubmissionTracking(state.playerOrder);

    // once all is set up, broadcast event to start game
    toGame(serverEvents.gameStart);
  });

  // *** GAMEPLAY ***
  socket.on(clientEvents.fetchInitialPrompt, (cb) => {
    cb(thisPlayer.sketchbook[0].guess);
  });

  socket.on(clientEvents.fetchCurrentSubmission, (cb) => {
    // return the appropriate doodle/guess data for that player, based on current round & num of players & player order array
    thisPlayer.heldSketchbook = getHeldSketchbook(socket.id, state); // should return reference to another player's sketchbook based on round # offset
    cb(_.last(thisPlayer.heldSketchbook));
  });

  // trying out check-if-per-submission approach
  socket.on(clientEvents.playerSubmit, (data) => {
    // data from client is just doodle JSON or a guess string--need to format w/author, etc.
    // push doodle/guess object into appropriate "previous" player's book
    const submission = formatSubmission(data, thisPlayer, state);
    thisPlayer.heldSketchbook.push(submission); // this should be the same player determiend in "fetch-current-submission". At the start of a round, you get the last entry of a previous player's sketchbook according to round offset. During that round, your submission is pushed to the sketchbook of that same player.

    // mark player as hasSubmitted
    state.submissionTracking[socket.id] = true;

    // check if round is over
    if (isFinalSubmission(state)) {
      // increment round
      state.currentRound++;
      // check for end of game
      if (state.currentRound > state.numOfRounds) {
        // tell all clients to advance to game end screen, where "fetch-game-end" event will be emitted
        toGame("start-post-game");
        toGame(serverEvents.info, buildAllSketchbooks(state));
        return;
      }

      console.log(`moving to round ${state.currentRound}!`);
      state.roundType = state.roundType === "guess" ? "doodle" : "guess";
      // reset round-specific state like hasSubmitted props
      resetForNextRound(state);
      // notify all players
      toGame(serverEvents.nextRound, state.roundType); // even/odd round # determines doodle vs. guess round
    }
  });

  socket.on("fetch-game-end", (cb) => {
    // const allSketchbooks; - compile an array of all player sketchbooks. Send to all clients, where each will be displayed
    const allSketchbooks = buildAllSketchbooks(state);
    cb(allSketchbooks);
  });
};

module.exports = {
  jackInToMatrix,
};
