import { AppDataSource } from "../data-source";
import { Vlog } from "../entity/Vlog";
import { VideoFile } from "../entity/VideoFile";
import * as faker from "faker";

/**
 * Seed Vlog rows using TypeORM Class-Table Inheritance.
 * TypeORM will automatically create both Article and Vlog table rows.
 */
export async function seedVlogs(ensureCount: number = 5): Promise<Vlog[]> {
  const vlogRepository = AppDataSource.getRepository(Vlog);
  const videoFileRepository = AppDataSource.getRepository(VideoFile);

  // Check if vlogs already exist
  const existingCount = await vlogRepository.count();
  if (existingCount > 0) {
    console.log(`Vlogs already seeded (${existingCount} vlogs found). Skipping...`);
    return await vlogRepository.find();
  }

  console.log(`Creating ${ensureCount} vlog(s) with TypeORM inheritance...`);

  // Ensure video files exist
  let videoFiles = await videoFileRepository.find();
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

    // Create Vlog directly - TypeORM will create both Article and Vlog rows
    const vlog = new Vlog();
    vlog.Excerpt = faker.lorem.sentence();
    vlog.Slug = faker.helpers.slugify(faker.lorem.words(3)).toLowerCase();
    vlog.Content = faker.lorem.paragraphs(3);
    vlog.Tags = tags;
    vlog.PublishedAt = publishedAt;
    vlog.UpdatedAt = updatedAt;
    vlog.VideoFileId = videoFiles[i % videoFiles.length].VideoFileId;
    vlog.VideoFile = videoFiles[i % videoFiles.length];

    vlogs.push(vlog);
  }

  await vlogRepository.save(vlogs);
  console.log(`✓ Seeded ${vlogs.length} vlogs`);
  return vlogs;
}
