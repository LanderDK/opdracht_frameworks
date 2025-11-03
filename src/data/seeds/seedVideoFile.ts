import AppDataSource from "../data-source";
import VideoFile from "../entity/VideoFile";
import * as faker from "faker";

export default async function seedVideoFiles(count: number = 10): Promise<VideoFile[]> {
  const videoFileRepository = AppDataSource.getRepository(VideoFile);

  // Check if video files already exist
  const existingCount = await videoFileRepository.count();
  if (existingCount > 0) {
    console.log(
      `Video files already seeded (${existingCount} video files found). Skipping...`
    );
    return await videoFileRepository.find();
  }

  const videoFiles: VideoFile[] = [];
  const videoHosts = ["youtube.com", "vimeo.com", "dailymotion.com"];

  for (let i = 0; i < count; i++) {
    const videoFile = new VideoFile();
    const host = videoHosts[Math.floor(Math.random() * videoHosts.length)];
    const videoId = faker.datatype.uuid().substring(0, 11);
    videoFile.VideoFileUrl = `https://www.${host}/watch?v=${videoId}`;
    videoFiles.push(videoFile);
  }

  await videoFileRepository.save(videoFiles);
  console.log(`✓ Seeded ${videoFiles.length} video files`);
  return videoFiles;
}
