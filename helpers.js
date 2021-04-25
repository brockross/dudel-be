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

const isFinalSubmission = (submissionTracking) => {
  // check that all entries in state.hasSubmitted are true
  return _.every(submissionTracking);
};

module.exports = {
  generateGameCode,
  getPlayerListForClient,
  getInitialPrompt,
  getShuffledPlayerList,
  initSubmissionTracking,
  isFinalSubmission,
};
