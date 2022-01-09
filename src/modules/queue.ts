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
import { MessageEmbed, TextBasedChannel, VoiceBasedChannel } from "discord.js";
import ytdl from "ytdl-core";
import { Song } from "../modules/song";

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
}
