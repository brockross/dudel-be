// set up all the game logic listeners on the socket
const { serverEvents, clientEvents } = require("./constants");
const {
  getPlayerListForClient,
  getInitialPrompt,
  getShuffledPlayerList,
  initSubmissionTracking,
  isFinalSubmission,
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
    }

    // - player order
    state.playerOrder = getShuffledPlayerList(state.players);

    // - # of rounds
    state.currentRound = 0;
    state.numOfRounds = state.players.values().length - 1;

    // submission tracking init
    state.submissionTracking = initSubmissionTracking(state.playerOrder);

    // once all is set up, broadcast event to start game
    toGame(serverEvents.gameStart);
  });

  // *** GAMEPLAY ***
  socket.on(clientEvents.fetchInitialPrompt, (cb) => {
    cb(thisPlayer.sketchbook[0].guess);
  });

  socket.on("fetch-current-submission", (cb) => {
    // return the appropriate doodle/guess data for that player, based on current round & num of players & player order array
    // total players = 3 ([0, 1, 2])
    // this player's idx = 1
    // round = 1 (2nd)
    // give them the last entry of sketchbook of player at idx 2 (1 + 1)
    // for player at idx 2, give them the last entry of player at idx 0 (need logic to wrap array)
  });

  // when a guess/doodle is received, update logic for tracking round end + moving to next round
  // how do I then trigger a notification to everyone to "start the next round" ?
  // - could be an if statement in the single listener after incrementing submissions (so the final player to submit essentially passes the submissions == totalPlayers condition, which triggers the next round)
  // - could be a while loop in game state? Not sure how to structure that though
  // - promise resolution? (i.e., server initiates a "get all the doodles" promise, which awaits a promise.all of all the players' submissions, upon completion of which the round resets and all players are notified)
  // - regardless of method, I think I want more descriptive/explicit tracking of submisisons, like a list of players with hasSubmitted properties is kept and checked against, rather than just inferring based on comparing player count and submission count. This makes the state less brittle, e.g. if a client somehow sends two submissions it won't throw the whole game state out of whack

  // trying out check-if-per-submission approach
  socket.on("player-submit", (data) => {
    // push doodle/guess object into appropriate player's book

    // mark player as hasSubmitted
    state.submissionTracking[socket.id] = true;

    // check if round is over
    if (isFinalSubmission(state.submissionTracking)) {
      // i.e., check if all players' hasSubmitted prop is true
      // increment round
      state.currentRound++;
      // reset round-specific state like hasSubmitted props
      resetForNextRound();
      // notify all players
      toGame(serverEvents.nextRound, getRoundType()); // even/odd round # determines doodle vs. guess round
      // the nextRound event would trigger each client to render the opposite gameplay screen, in whose useEffect would be the fetch-current-submission event emit (so once again we're waiting for the client to ask for data rather than just sending it and assuming their associated listener is ready)
    }
  });
};

module.exports = {
  jackInToMatrix,
};
