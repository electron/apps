var Sequelize = require('sequelize')

var attributes = {
  userid: {
    type: Sequelize.INTEGER,
  },
  start: {
    type: Sequelize.TIME,
  },
  end1: {
    type: Sequelize.TIME,
  },
  activity: {
    type: Sequelize.STRING,
  },
  yearmonthday: {
    type: Sequelize.STRING,
  },
  color: {
    type: Sequelize.STRING,
  },
  pfirst: {
    type: Sequelize.STRING,
  },
  plast: {
    type: Sequelize.STRING,
  },
  dfirst: {
    type: Sequelize.STRING,
  },
  dlast: {
    type: Sequelize.STRING,
  },
  requestid: {
    type: Sequelize.INTEGER,
  },

}

var options = {
  freezeTableName: true
}

module.exports.attributes = attributes
module.exports.options = options
