import stream from "stream";
import ffmpeg from "fluent-ffmpeg";
import ytdl from "@distube/ytdl-core";

export const getVideoInfo = async (videoUrl: string) => {
  const video = await ytdl.getInfo(videoUrl);
  const formats = video.formats.filter(
    (format) => format.hasAudio === true && format.audioCodec === "opus"
  );
  formats.sort((a, b) => {
    if (a.hasVideo && !b.hasVideo) return 1;
    if (!a.hasVideo && b.hasVideo) return -1;
    return 0;
  });
  return formats[0];
};

export async function getPartialAudio(videoUrl: string, startFrom: number) {
  const videoInfo = await getVideoInfo(videoUrl);

  const ff = ffmpeg(videoInfo.url).seek(startFrom).format("ogg");

  const ffStream = new stream.PassThrough();
  ff.pipe(ffStream, { end: true });

  return ffStream;
}
