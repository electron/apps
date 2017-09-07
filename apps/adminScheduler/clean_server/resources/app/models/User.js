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
    //defines email as a string value
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
  }
  ,
  admin: {
  type: Sequelize.STRING
},
  city:{
    type: Sequelize.STRING
  },
  specialty:{
    type: Sequelize.STRING
  }



}

var options = {
  //just ensures table names do not change
  freezeTableName: true
}

module.exports.attributes = attributes
module.exports.options = options
