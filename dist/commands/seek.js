"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
const time_1 = require("../modules/time");
exports.default = new types_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("이동")
    .setDescription("노래의 다른 부분을 재생합니다.")
    .addStringOption((option) => option
    .setName("시간")
    .setDescription("[시:][분:]초 형식으로 입력하여 특정 지점으로 이동하거나, 앞에 + 또는 -를 붙여 재생 중인 부분에서 이동할 수 있습니다.")
    .setRequired(true)), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    const player = bot.manager.players.get(interaction.guildId);
    if (!player || !player.current) {
        return await interaction.editReply("현재 재생 중인 노래가 없어요.");
    }
    if (author.voice.channel.id !== player.voiceChannelId)
        return await interaction.editReply("봇과 같은 음성 채널에 참가하세요.");
    let str = interaction.options.getString("시간", true);
    let relative = "";
    if (str.startsWith("+") || str.startsWith("-")) {
        relative = str[0];
        str = str.slice(1);
    }
    const sections = str.split(":").map((s) => Number(s.trim()));
    if (sections.length > 3 || sections.some((n) => isNaN(n) || n < 0)) {
        return await interaction.editReply("시간 형식이 올바르지 않아요.");
    }
    let ms = 0;
    while (sections.length) {
        const section = sections.shift();
        ms *= 60;
        ms += section;
    }
    ms *= 1000;
    if (relative === "+") {
        ms += player.current.position;
    }
    else if (relative === "-") {
        ms -= player.current.position;
    }
    if (ms < 0 || ms > player.current.duration) {
        return await interaction.editReply("시간 범위를 벗어났어요.");
    }
    player.seek(ms);
    await interaction.editReply({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor("#0090ff")
                .setTitle(`:left_right_arrow: \`${(0, time_1.timeString)(ms / 1000)}\`으로 이동했어요`),
        ],
    });
});
