const { ActivityType } = require("discord.js");
const client = require("../index");

client.on("ready", async () => {

  console.log(`${client.user.username} Is Online`);

	client.user.setActivity({
		type: ActivityType.Custom,
		name: 'customstatus',
		state: 'Mrrp mreow~'
	});

	//await require("../database/dbHandler")(client);

});