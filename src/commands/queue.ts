import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot, Command, Song } from "../types";

module.exports = new Command(
    new SlashCommandBuilder().setName("목록").setDescription("재생 목록을 확인합니다."),
    async (interaction: CommandInteraction, bot: Bot) => {
        await interaction.reply("재생 목록:");
        bot.player.queue
            .get(interaction.guildId ? interaction.guildId : "")
            ?.songs.forEach(
                async (song: Song) => await interaction.followUp("```" + JSON.stringify(song, undefined, 2) + "```")
            );
    }
);
