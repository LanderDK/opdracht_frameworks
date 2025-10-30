import { AppDataSource } from "../data-source";
import { Article } from "../entity/Article";
import * as faker from "faker";

export async function seedArticles(count: number = 20): Promise<Article[]> {
  const articleRepository = AppDataSource.getRepository(Article);

  // Check if articles already exist
  const existingCount = await articleRepository.count();
  if (existingCount > 0) {
    console.log(
      `Articles already seeded (${existingCount} articles found). Skipping...`
    );
    return await articleRepository.find();
  }

  const articles: Article[] = [];
  const articleTypes = ["blog", "vlog"];
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

  for (let i = 0; i < count; i++) {
    // Build tags array
    const numTags = Math.floor(Math.random() * 4) + 2;
    const shuffledTags = [...availableTags].sort(() => Math.random() - 0.5);
    const tags: string[] = [];
    for (let j = 0; j < numTags && j < shuffledTags.length; j++) {
      tags.push(shuffledTags[j]);
    }

    // Dates
    const publishedAt = faker.date.past(1);
    const updatedAt = faker.date.between(publishedAt, new Date());

    // Create a plain object instead of instantiating abstract Article
    const articleData: Partial<Article> = {
      Excerpt: faker.lorem.sentence(),
      Title: faker.lorem.words(3),
      Slug: faker.helpers.slugify(faker.lorem.words(3)).toLowerCase(),
      Content: faker.lorem.paragraphs(3),
      Tags: tags,
      PublishedAt: publishedAt,
      UpdatedAt: updatedAt,
    };

    articles.push(articleData as Article);
  }

  await articleRepository.save(articles);
  console.log(`✓ Seeded ${articles.length} articles`);
  return articles;
}
