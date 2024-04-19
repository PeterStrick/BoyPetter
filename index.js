const Bot = require("./handlers/client");
const { TOKEN } = require("./settings/config");
const client = new Bot();

module.exports = client;

client.start(TOKEN);

process.on("unhandledRejection", (r, p) => {
  console.log(" [Error_Handling] :: Unhandled Rejection/Catch");
  console.log(r, p);
});
 
process.on("uncaughtException", (r, p) => {
  console.log(" [Error_Handling] :: Uncaught Exception/Catch");
  console.log(r, p);
});
 
process.on("uncaughtExceptionMonitor", (r, p) => {
  console.log(" [Error_Handling] :: Uncaught Exception/Catch (MONITOR)");
  console.log(r, p);
});