const { Listener } = require("discord-akairo");
const Discord = require("discord.js");
const { isRolesMessage } = require("../functions.js")
const config = require("../config.js")

class ReadyListener extends Listener {
	constructor() {
		super(
			"ready",
			{
				emitter: "client",
				event: "ready"
			}
		);
	}

	async exec() {
		let output = ""
		let ownerUser;
		if (this.client.testMode) {
			output += "Started in testing mode\n"
		} else {
			output += "Started in normal mode\n"
		}
		for (let [, guild] of this.client.guilds.cache.filter(g => this.client.testMode == (g.id == "394948324999954432"))) {
			await guild.members.fetch()
			let ch_server_info = guild.channels.cache.find(c => c.name == "server-info")
			if (ch_server_info) {
				let messages = await ch_server_info.messages.fetch({ limit: 100 })
				if (messages.some(m => m.content.startsWith("**ROLES**"))) {
					output += `Found roles message for ${guild.name}\n`
				}
			}
			let ch_whitelist = guild.channels.cache.find(c => c.name == "whitelist")
			if (ch_whitelist) {
				output += `Found whitelist channel for ${guild.name}\n`
				await ch_whitelist.messages.fetch({ limit: 100 })
			}
			if (!ownerUser) {
				let ownerMember = await guild.members.cache.find(m => m.id == this.client.ownerID)
				if (ownerMember) {
					ownerUser = ownerMember.user
				}
			}
		}
		output = output.trim()
		if (this.client.testMode) {
			console.log(output)
		} else {
			if (ownerUser) {
				await ownerUser.send({embed:{
					title: "Bot Restarted",
					description: output,
					color: config.colour,
					fields: [
						{
							name: "Release Info",
							value: `[Commit](https://github.com/JosephLGibson/Pizza-Bot/commit/${process.env.HEROKU_SLUG_COMMIT})
							**Release Version**: ${process.env.HEROKU_RELEASE_VERSION}
							**Released on**: ${process.env.HEROKU_RELEASE_CREATED_AT}
							**Deploy Description**: ${process.env.HEROKU_SLUG_DESCRIPTION}`
						}
					],
					timestamp: new Date()
				}})
			} else {
				console.log(output)
			}
		}
		await this.client.user.setPresence(
			{	
				status: "online",
				activity: {
					name: "/help",
					type: "LISTENING"
				},
			}
		)
		console.log("Ready!")
	}
}

module.exports = ReadyListener;