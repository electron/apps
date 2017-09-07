/*var Sequelize = require('sequelize'),
    sequelize = new Sequelize('postgres://user:password@localhost:5432/database')

module.exports = sequelize*/


var Sequelize = require('sequelize'),
   sequelize = new Sequelize('postgres://daniel:admin@localhost:5432/seq')
//here you will need to configure sequelize to work for your own setup
module.exports = sequelize
