const _ = require("lodash");

const generateGameCode = () => {
  const randomCode = _.random(1000, 9999).toString();
  return randomCode;
};

module.exports = {
  generateGameCode,
};
