const _ = require("lodash");

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
module.exports = {
  generateGameCode,
  getPlayerListForClient,
};
