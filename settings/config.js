require("dotenv").config({ path: './settings/.env' });
module.exports = {
    TOKEN: process.env.TOKEN,
    APP_ID: process.env.APP_ID
}