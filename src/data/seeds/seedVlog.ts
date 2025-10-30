import { AppDataSource } from "../data-source";
import { Vlog } from "../entity/Vlog";
import { Article } from "../entity/Article";
import { VideoFile } from "../entity/VideoFile";
import * as faker from "faker";

/**
 * Seed Vlog rows. Each Vlog must reference an Article row with ArticleType = 'vlog'
 * and a VideoFile. If necessary, this will create missing Article rows and
 * sample VideoFile rows.
 */
export async function seedVlogs(ensureCount: number = 5): Promise<Vlog[]> {
  const vlogRepository = AppDataSource.getRepository(Vlog);
  const articleRepository = AppDataSource.getRepository(Article);
  const videoFileRepository = AppDataSource.getRepository(VideoFile);

  // Check if vlogs already exist
  const existingCount = await vlogRepository.count();
  if (existingCount > 0) {
    console.log(`Vlogs already seeded (${existingCount} vlogs found). Skipping...`);
    return await vlogRepository.find();
  }

  // Fetch existing vlog articles and video files
  let vlogArticles = await articleRepository.find({ where: { ArticleType: "vlog" } });
  let videoFiles = await videoFileRepository.find();

  // If not enough vlog articles, create missing ones
  if (vlogArticles.length < ensureCount) {
    const toCreate = ensureCount - vlogArticles.length;
    console.log(`Creating ${toCreate} missing vlog Article(s)`);

    const availableTags = [
      "technology",
      "programming",
      "javascript",
      "typescript",
      "database",
      "tutorial",
      "news",
      "opinion",
      "review",
      "beginner",
      "advanced",
    ];

    const newArticles: Partial<Article>[] = [];
    for (let i = 0; i < toCreate; i++) {
      const numTags = Math.floor(Math.random() * 4) + 2;
      const shuffledTags = [...availableTags].sort(() => Math.random() - 0.5);
      const tags: string[] = [];
      for (let j = 0; j < numTags && j < shuffledTags.length; j++) {
        tags.push(shuffledTags[j]);
      }

      const publishedAt = faker.date.past(1);
      const updatedAt = faker.date.between(publishedAt, new Date());

      newArticles.push({
        Title: faker.lorem.sentence(),
        Excerpt: faker.lorem.sentence(),
        ArticleType: "vlog",
        Slug: faker.helpers.slugify(faker.lorem.words(3)).toLowerCase(),
        Content: faker.lorem.paragraphs(3),
        Tags: tags,
        PublishedAt: publishedAt,
        UpdatedAt: updatedAt,
      });
    }

    const saved = await articleRepository.save(newArticles as Article[]);
    vlogArticles = vlogArticles.concat(saved);
  }

  if (vlogArticles.length === 0) {
    console.log("No vlog articles found to create vlogs");
    return [];
  }

  // If no video files exist, create some sample ones
  if (videoFiles.length === 0) {
    console.log("No video files found — creating sample video files");
    const newVideoFiles: Partial<VideoFile>[] = [];
    const videoHosts = ["youtube.com", "vimeo.com", "dailymotion.com"];
    for (let i = 0; i < Math.max(ensureCount, 3); i++) {
      const host = videoHosts[Math.floor(Math.random() * videoHosts.length)];
      const videoId = faker.datatype.uuid().substring(0, 11);
      newVideoFiles.push({ VideoFileUrl: `https://www.${host}/watch?v=${videoId}` });
    }
    const savedFiles = await videoFileRepository.save(newVideoFiles as VideoFile[]);
    videoFiles = savedFiles;
  }

  const vlogs: Vlog[] = [];
  const pairs = Math.min(vlogArticles.length, videoFiles.length);
  for (let i = 0; i < pairs; i++) {
    const vlog = new Vlog();
    vlog.VlogId = vlogArticles[i].ArticleId;
    vlog.article = vlogArticles[i];
    vlog.VideoFileId = videoFiles[i].VideoFileId;
    vlog.videofile = videoFiles[i];
    vlogs.push(vlog);
  }

  await vlogRepository.save(vlogs);
  console.log(`✓ Seeded ${vlogs.length} vlogs`);
  return vlogs;
}
