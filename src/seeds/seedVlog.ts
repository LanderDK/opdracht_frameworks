import { AppDataSource } from "../data-source";
import { Vlog } from "../entity/Vlog";
import { Article } from "../entity/Article";
import { VideoFile } from "../entity/VideoFile";

export async function seedVlogs(): Promise<Vlog[]> {
  const vlogRepository = AppDataSource.getRepository(Vlog);
  const articleRepository = AppDataSource.getRepository(Article);
  const videoFileRepository = AppDataSource.getRepository(VideoFile);

  // Check if vlogs already exist
  const existingCount = await vlogRepository.count();
  if (existingCount > 0) {
    console.log(
      `Vlogs already seeded (${existingCount} vlogs found). Skipping...`
    );
    return await vlogRepository.find();
  }

  // Get all articles with type 'vlog'
  const vlogArticles = await articleRepository.find({
    where: { ArticleType: "vlog" },
  });

  // Get all video files
  const videoFiles = await videoFileRepository.find();

  if (vlogArticles.length === 0) {
    console.log("No vlog articles found to create vlogs");
    return [];
  }

  if (videoFiles.length === 0) {
    console.log("No video files found to create vlogs");
    return [];
  }

  const vlogs: Vlog[] = [];

  for (let i = 0; i < vlogArticles.length && i < videoFiles.length; i++) {
    const vlog = new Vlog();
    vlog.VlogId = vlogArticles[i].ArticleId;
    vlog.VideoFileId = videoFiles[i].VideoFileId;
    vlogs.push(vlog);
  }

  await vlogRepository.save(vlogs);
  console.log(`✓ Seeded ${vlogs.length} vlogs`);
  return vlogs;
}
