import {
    Client,
    ClientOptions,
    Collection,
    GuildMember,
    MessageEmbed,
    TextBasedChannel,
    VoiceBasedChannel,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    demuxProbe,
    DiscordGatewayAdapterCreator,
    joinVoiceChannel,
    NoSubscriberBehavior,
    VoiceConnection,
} from "@discordjs/voice";
import ytdl, { videoInfo } from "ytdl-core";

export class Bot extends Client {
    player: Player;
    commands: Collection<string, Command>;
    adminCommands: Collection<string, Command>;

    constructor(clientOptions: ClientOptions) {
        super(clientOptions);
        this.player = new Player();
        this.commands = new Collection<string, Command>();
        this.adminCommands = new Collection<string, Command>();
    }
}

export class Player {
    queue: Collection<string, Queue>;

    constructor() {
        this.queue = new Collection<string, Queue>();
    }
}

export class Queue {
    textChannel: TextBasedChannel;
    voiceChannel: VoiceBasedChannel;
    connection: VoiceConnection;
    songs: Song[];
    isPlaying: boolean;
    audioPlayer: AudioPlayer;
    async play(song: Song) {
        let { stream, type } = await demuxProbe(ytdl(song.url, { quality: "lowestaudio" }));
        this.audioPlayer.play(createAudioResource(stream, { inputType: type }));
        this.connection.subscribe(this.audioPlayer);
        this.isPlaying = true;
    }

    constructor(textChannel: TextBasedChannel, voiceChannel: VoiceBasedChannel) {
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.connection = joinVoiceChannel({
            guildId: voiceChannel.guildId,
            channelId: voiceChannel.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
        this.songs = [];
        this.isPlaying = false;
        this.audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        this.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
            this.songs.shift();
            if (this.songs.length > 0) {
                this.play(this.songs[0]);
            } else this.isPlaying = false;
        });
        this.audioPlayer.on(AudioPlayerStatus.Playing, async () => {
            await this.textChannel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("#0067a3")
                        .setTitle(":arrow_forward: 다음 곡을 재생할게요")
                        .setDescription(
                            `[${this.songs[0].title}](${this.songs[0].url}) (${
                                this.songs[0].duration > 59 ? Math.floor(this.songs[0].duration / 60) : "0"
                            }:${this.songs[0].duration % 60})`
                        )
                        .setThumbnail(this.songs[0].thumbnail)
                        .setFooter({
                            text: `${this.songs[0].requestedUser.nickname} 님이 신청하셨어요.`,
                            iconURL: this.songs[0].requestedUser.displayAvatarURL(),
                        }),
                ],
            });
        });
    }
}

export class Song {
    title: string;
    url: string;
    thumbnail: string;
    duration: number;
    isLive: boolean;
    requestedUser: GuildMember;

    constructor(songInfo: videoInfo, requestedUser: GuildMember) {
        this.title = songInfo.videoDetails.title;
        this.url = songInfo.videoDetails.video_url;
        this.thumbnail = `https://i.ytimg.com/vi/${songInfo.videoDetails.videoId}/hqdefault.jpg`;
        this.duration = Number(songInfo.videoDetails.lengthSeconds);
        this.isLive = songInfo.videoDetails.isLiveContent;
        this.requestedUser = requestedUser;
    }
}

export class Command {
    data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
    execute: Function;

    constructor(data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">, execute: Function) {
        this.data = data;
        this.execute = execute;
    }
}
