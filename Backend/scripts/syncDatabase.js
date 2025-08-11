const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user');

const {sequelize} = require('../models/index');
require('../models/card');
require('../models/deck');

sequelize.sync()
    .then(() => {
        console.log('Database synchronized successfully');
    })
    .catch((error) => { 
        console.error('Error synchronizing database:', error);
    })
    .finally(() => {
        sequelize.close();
        console.log('Database connection closed');
    });
