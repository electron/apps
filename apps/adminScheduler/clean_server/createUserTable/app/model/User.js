var Sequelize = require('sequelize')

var attributes = {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-z0-9\_\-]+$/i,
    }
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  },
  first: {
    type: Sequelize.STRING,
  },
  last: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
  salt: {
    type: Sequelize.STRING
  },
  admin: {
    type: Sequelize.STRING
  },
  specialty: {
    type: Sequelize.STRING
  },
  city: {
    type: Sequelize.STRING
  },
  docid: {
    type: Sequelize.INTEGER
  },
}

var options = {
  freezeTableName: true
}

module.exports.attributes = attributes
module.exports.options = options
