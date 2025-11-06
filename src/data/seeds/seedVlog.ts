import AppDataSource from "../data-source";
import Vlog from "../entity/Vlog";
import VideoFile from "../entity/VideoFile";
import * as faker from "faker";
import ArticleType from "../enum/ArticleType";

/**
 * Seed Vlog rows using TypeORM Single Table Inheritance.
 * TypeORM will create rows in the Article table with ArticleType='VLOG'.
 */
export default async function seedVlogs(
  ensureCount: number = 5
): Promise<Vlog[]> {
  const vlogRepository = AppDataSource.getRepository(Vlog);
  const videoFileRepository = AppDataSource.getRepository(VideoFile);
  const userArticleRepository = AppDataSource.getRepository("UserArticle");

  // Check if vlogs already exist
  const existingCount = await vlogRepository.count();

  if (existingCount > 0) {
    console.log(
      `Vlogs already seeded (${existingCount} vlogs found). Skipping...`
    );
    return await vlogRepository.find();
  }

  console.log(
    `Creating ${ensureCount} vlog(s) with TypeORM Single Table Inheritance...`
  );

  // Ensure video files exist
  let videoFiles = await videoFileRepository.find();

  if (videoFiles.length === 0) {
    console.log("No video files found — creating sample video files");
    const newVideoFiles: Partial<VideoFile>[] = [];
    for (let i = 0; i < Math.max(ensureCount, 3); i++) {
      newVideoFiles.push({
        VideoFileUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      });
    }
    const savedFiles = await videoFileRepository.save(
      newVideoFiles as VideoFile[]
    );
    videoFiles = savedFiles;
  }

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

  const vlogs: Vlog[] = [];
  for (let i = 0; i < ensureCount; i++) {
    const numTags = Math.floor(Math.random() * 4) + 2;
    const shuffledTags = [...availableTags].sort(() => Math.random() - 0.5);
    const tags: string[] = [];
    for (let j = 0; j < numTags && j < shuffledTags.length; j++) {
      tags.push(shuffledTags[j]);
    }

    const publishedAt = faker.date.past(1);
    const updatedAt = faker.date.between(publishedAt, new Date());

    // Create Vlog directly - inherits Article properties
    const vlog = new Vlog();
    vlog.Title = faker.lorem.sentence();
    vlog.Excerpt = faker.lorem.sentence();
    vlog.Slug = faker.helpers.slugify(faker.lorem.words(3)).toLowerCase();
    vlog.Content = faker.lorem.paragraphs(3);
    vlog.Tags = tags;
    vlog.PublishedAt = publishedAt;
    vlog.UpdatedAt = updatedAt;
    vlog.ArticleType = ArticleType.VLOG;
    vlog.VideoFileId = videoFiles[i % videoFiles.length].VideoFileId;

    vlogs.push(vlog);
  }

  await vlogRepository.save(vlogs);
  console.log(`✓ Seeded ${vlogs.length} vlogs`);

  for (const vlog of vlogs) {
    const count = Math.floor(Math.random() * 3) + 1; // 1..3
    const useridsSet = new Set<number>();
    while (useridsSet.size < count) {
      useridsSet.add(Math.floor(Math.random() * 5) + 1); // 1..5
    }
    const articleid = vlog.ArticleId;
    for (const userid of useridsSet) {
      await userArticleRepository.save({
        UserId: userid,
        ArticleId: articleid,
      });
    }
  }

  return vlogs;
}
