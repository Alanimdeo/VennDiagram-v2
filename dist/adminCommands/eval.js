"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("eval").setDescription("명령 실행"), async (message, bot) => {
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
        console.error(err);
    }
});
