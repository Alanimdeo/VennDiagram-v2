import stream from "stream";
import ffmpeg from "fluent-ffmpeg";
import ytdl from "ytdl-core";

export const getVideoInfo = async (videoUrl: string) =>
  (await ytdl.getInfo(videoUrl)).formats.filter((format) => format.mimeType?.startsWith("audio/mp4"))[0];

export async function getPartialAudio(videoUrl: string, startFrom: number) {
  const videoInfo = await getVideoInfo(videoUrl);

  const ff = ffmpeg(videoInfo.url).seek(startFrom).audioCodec("opus").format("ogg");

  const ffStream = new stream.PassThrough();
  ff.pipe(ffStream, { end: true });

  return ffStream;
}
