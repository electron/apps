//exports sequalize string
var Sequelize = require('sequelize'),
   sequelize = new Sequelize('postgres://daniel:admin@localhost:5432/seq')

module.exports = sequelize
