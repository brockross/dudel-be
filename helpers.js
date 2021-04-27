const { startCase } = require("lodash");
const _ = require("lodash");
const { PROMPTS_LIST } = require("./constants");

const generateGameCode = () => {
  const randomCode = _.random(1000, 9999).toString();
  return randomCode;
};

const getPlayerListForClient = (game) => {
  const { players } = game.state;

  const listForClient = [...players.values()].map(({ username, isFounder }) => {
    return { username, isFounder };
  });

  return listForClient;
};

const getShuffledPlayerList = (playerList) => {
  return _.shuffle([...playerList.keys()]);
};

const initSubmissionTracking = (playerIdList) => {
  const submissionTracking = {};
  playerIdList.forEach((id) => {
    submissionTracking[id] = false;
  });

  return submissionTracking;
};

const getInitialPrompt = () => {
  const randIdx = _.random(0, PROMPTS_LIST.length - 1);
  const prompt = PROMPTS_LIST[randIdx];
  return prompt;
};

const getHeldSketchbook = (socketId, state) => {
  const roundOffset = state.currentRound - 1; // i.e., round 1 offset is 0, round 2 offset is 1, etc.
  const thisPlayerIdx = state.playerOrder.indexOf(socketId);
  const heldSketchbookPlayerIdx = thisPlayerIdx - roundOffset;
  const adjustedIdx =
    heldSketchbookPlayerIdx >= 0
      ? heldSketchbookPlayerIdx
      : state.playerOrder.length - Math.abs(heldSketchbookPlayerIdx);
  const heldSketchbookPlayerId = state.playerOrder[adjustedIdx];

  console.log(
    `getHeldSketchbook | offset: ${roundOffset} | adjustedIdx: ${adjustedIdx}`
  );

  return state.players.get(heldSketchbookPlayerId).sketchbook;
};

const formatSubmission = (data, thisPlayer, state) => {
  if (state.roundType === "guess") {
    return {
      type: "guess",
      guess: data,
      author: thisPlayer.username,
    };
  }
  if (state.roundType === "doodle") {
    return {
      type: "doodle",
      doodleJSON: data,
      artist: thisPlayer.username,
    };
  }
};

const isFinalSubmission = (state) => {
  return _.every(state.playerOrder, (id) => {
    return state.submissionTracking[id] === true;
  });
};

const resetForNextRound = (state) => {
  // reset all submission tracking entries to false
  state.submissionTracking = initSubmissionTracking(state.playerOrder);
};

const buildAllSketchbooks = (state) => {
  const compiledBook = [];
  state.playerOrder.forEach((playerId) => {
    compiledBook.push(state.players.get(playerId).sketchbook);
  });

  return compiledBook;
};

module.exports = {
  generateGameCode,
  getPlayerListForClient,
  getInitialPrompt,
  getShuffledPlayerList,
  initSubmissionTracking,
  isFinalSubmission,
  resetForNextRound,
  getHeldSketchbook,
  formatSubmission,
  buildAllSketchbooks,
};
