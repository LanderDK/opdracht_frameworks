import AppDataSource from "../data-source";
import VideoFile from "../entity/VideoFile";

export default async function seedVideoFiles(
  count: number = 10
): Promise<VideoFile[]> {
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

  for (let i = 0; i < count; i++) {
    const videoFile = new VideoFile();
    videoFile.VideoFileUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    videoFiles.push(videoFile);
  }

  await videoFileRepository.save(videoFiles);
  console.log(`✓ Seeded ${videoFiles.length} video files`);
  return videoFiles;
}
