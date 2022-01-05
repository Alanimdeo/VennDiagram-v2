"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.Song = exports.Queue = exports.Player = exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
class Bot extends discord_js_1.Client {
    constructor(clientOptions) {
        super(clientOptions);
        this.player = new Player();
        this.commands = new discord_js_1.Collection();
        this.adminCommands = new discord_js_1.Collection();
    }
}
exports.Bot = Bot;
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
                        .setTitle(":arrow_forward: 다음 곡을 재생할게요")
                        .setDescription(`[${this.songs[0].title}](${this.songs[0].url}) (${this.songs[0].duration})`)
                        .setThumbnail(this.songs[0].thumbnail)
                        .setFooter({
                        text: `${this.songs[0].requestedUser.nickname} 님이 신청하셨어요.`,
                        iconURL: this.songs[0].requestedUser.displayAvatarURL(),
                    }),
                ],
            });
        });
    }
    async play(song) {
        let { stream, type } = await (0, voice_1.demuxProbe)((0, ytdl_core_1.default)(song.url, { quality: "lowestaudio" }));
        this.audioPlayer.play((0, voice_1.createAudioResource)(stream, { inputType: type }));
        this.connection.subscribe(this.audioPlayer);
        this.isPlaying = true;
    }
}
exports.Queue = Queue;
class Song {
    constructor(songInfo, requestedUser) {
        this.title = songInfo.videoDetails.title;
        this.url = songInfo.videoDetails.video_url;
        this.thumbnail = `https://i.ytimg.com/vi/${songInfo.videoDetails.videoId}/hqdefault.jpg`;
        let duration = Number(songInfo.videoDetails.lengthSeconds);
        this.duration = `${duration > 59 ? Math.floor(duration / 60) : "0"}:${String(duration % 60).padStart(2, "0")}`;
        this.isLive = songInfo.videoDetails.isLiveContent;
        this.requestedUser = requestedUser;
    }
}
exports.Song = Song;
class Command {
    constructor(data, execute) {
        this.data = data;
        this.execute = execute;
    }
}
exports.Command = Command;
