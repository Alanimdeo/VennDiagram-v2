import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { Bot, Command } from "../types";

module.exports = new Command(
    new SlashCommandBuilder().setName("정지").setDescription("노래를 정지합니다. 정지해도 목록에서 사라지지 않습니다."),
    async (interaction: CommandInteraction, bot: Bot) => {
        await interaction.deferReply();
        let author: GuildMember = interaction.member as GuildMember;
        if (!author.voice.channel || !interaction.guildId)
            return await interaction.editReply("먼저 음성 채널에 참가하세요.");
        let guildQueue = bot.player.queue.get(interaction.guildId);
        if (!guildQueue || guildQueue.songs.length === 0 || !guildQueue.isPlaying)
            return await interaction.editReply("노래가 재생 중이지 않아요.");
        guildQueue.audioPlayer.stop();
        await interaction.editReply({
            embeds: [new MessageEmbed().setColor("#008000").setTitle(":pause_button: 곡을 정지했어요")],
        });
    }
);
