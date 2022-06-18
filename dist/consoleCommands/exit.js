"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("exit").setDescription("종료"), async (message, bot) => {
    await Promise.all(bot.player.queue.map((queue) => {
        queue.connection.disconnect();
        queue.connection.destroy();
        queue.audioPlayer.stop();
        return;
    }));
    process.exit();
});
