"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = exports.Player = void 0;
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const partialAudio_1 = require("./partialAudio");
class Player {
    constructor() {
        this.queue = new discord_js_1.Collection();
    }
}
exports.Player = Player;
class Queue {
    async play(song) {
        let probe;
        if (song.startFrom) {
            probe = await (0, voice_1.demuxProbe)(await (0, partialAudio_1.getPartialAudio)(song.url, song.startFrom));
        }
        else {
            probe = await (0, voice_1.demuxProbe)((0, ytdl_core_1.default)(song.url, {
                quality: "highestaudio",
                highWaterMark: 1 << 25,
            }));
        }
        this.audioPlayer.play((0, voice_1.createAudioResource)(probe.stream, {
            inputType: probe.type,
        }));
        this.connection.subscribe(this.audioPlayer);
        this.isPlaying = true;
    }
    constructor(textChannel, voiceChannel, bot) {
        this.bot = bot;
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.connection = (0, voice_1.joinVoiceChannel)({
            guildId: voiceChannel.guildId,
            channelId: voiceChannel.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        this.quitTimer = null;
        this.songs = [];
        this.isPlaying = false;
        this.repeatMode = "none";
        this.audioPlayer = (0, voice_1.createAudioPlayer)({ behaviors: { noSubscriber: voice_1.NoSubscriberBehavior.Pause } });
        this.audioPlayer.on(voice_1.AudioPlayerStatus.Idle, async () => {
            if (this.repeatMode === "none")
                this.songs.shift();
            else if (this.repeatMode === "all") {
                let shiftedSong = this.songs.shift();
                if (!shiftedSong)
                    return;
                this.songs.push(shiftedSong);
            }
            if (this.songs.length > 0) {
                this.play(this.songs[0]);
            }
            else {
                this.isPlaying = false;
                this.quitTimer = setTimeout(() => {
                    this.connection.destroy();
                    this.bot.player.queue.delete(this.voiceChannel.guildId);
                }, 1800000);
            }
        });
        this.audioPlayer.on(voice_1.AudioPlayerStatus.Playing, async () => {
            if (this.quitTimer) {
                clearTimeout(this.quitTimer);
                this.quitTimer = null;
            }
            if (this.repeatMode != "song")
                await this.textChannel.send({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
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
}
exports.Queue = Queue;
