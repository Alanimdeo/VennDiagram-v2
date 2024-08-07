"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
exports.default = new types_1.Command(new discord_js_1.SlashCommandBuilder().setName("deploy").setDescription("설치"), async (message, bot) => {
    const guildCommands = [];
    bot.commands.map((command) => guildCommands.push(command.data.toJSON()));
    if (!message.guild)
        return;
    await message.guild.commands.set(guildCommands);
    await message.reply(`Complete! Commands(${guildCommands.length}): ${guildCommands
        .map((command) => command.name)
        .toString()
        .replaceAll(",", ", ")}`);
});
