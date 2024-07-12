"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
exports.default = new types_1.Command(new discord_js_1.SlashCommandBuilder().setName("eval").setDescription("명령 실행"), async (message, bot) => {
    try {
        let command = message.content.split(" ");
        command.shift();
        command.shift();
        let result = eval(command.join(" "));
        if (typeof result === "object")
            result = JSON.stringify(result, undefined, 2);
        message.reply("```" + String(result) + "```");
    }
    catch (err) {
        message.reply("```" + String(err) + "```");
        console.error(err);
    }
});
