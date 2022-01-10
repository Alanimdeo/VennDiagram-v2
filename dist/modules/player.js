"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = exports.Player = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
class Player {
    constructor() {
        this.queue = new discord_js_1.Collection();
    }
}
exports.Player = Player;
class Queue {
    constructor(textChannel, voiceChannel) {
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.connection = (0, voice_1.joinVoiceChannel)({
            guildId: voiceChannel.guildId,
            channelId: voiceChannel.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        this.songs = [];
        this.isPlaying = false;
        this.audioPlayer = (0, voice_1.createAudioPlayer)({ behaviors: { noSubscriber: voice_1.NoSubscriberBehavior.Pause } });
        this.audioPlayer.on(voice_1.AudioPlayerStatus.Idle, async () => {
            this.songs.shift();
            if (this.songs.length > 0) {
                this.play(this.songs[0]);
            }
            else
                this.isPlaying = false;
        });
        this.audioPlayer.on(voice_1.AudioPlayerStatus.Playing, async () => {
            await this.textChannel.send({
                embeds: [
                    new discord_js_1.MessageEmbed()
                        .setColor("#0067a3")
                        .setTitle(":arrow_forward: 노래를 재생할게요")
                        .setDescription(`[${this.songs[0].title}](${this.songs[0].url}) (${this.songs[0].duration})`)
                        .setThumbnail(this.songs[0].thumbnail)
                        .setFooter({
                        text: `${this.songs[0].requestedUser.displayName} 님이 신청하셨어요.`,
                        iconURL: this.songs[0].requestedUser.displayAvatarURL(),
                    }),
                ],
            });
        });
    }
    async play(song) {
        let { stream, type } = await (0, voice_1.demuxProbe)((0, ytdl_core_1.default)(song.url, { quality: "highestaudio" }));
        this.audioPlayer.play((0, voice_1.createAudioResource)(stream, { inputType: type }));
        this.connection.subscribe(this.audioPlayer);
        this.isPlaying = true;
    }
}
exports.Queue = Queue;
