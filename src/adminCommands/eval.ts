import { SlashCommandBuilder } from "@discordjs/builders";
import { Message } from "discord.js";
import { Bot, Command } from "../types";

module.exports = new Command(
    new SlashCommandBuilder().setName("eval").setDescription("명령 실행"),
    async (message: Message, bot: Bot) => {
        let command = message.content.split(" ");
        command.shift();
        command.shift();
        let result = eval(command.join(" "));
        if (typeof result === "object") result = JSON.stringify(result, undefined, 2);
        message.reply("```" + String(result) + "```");
    }
);
