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
    const article = new Article();
    article.Excerpt = faker.lorem.sentence();
    article.ArticleType =
      articleTypes[Math.floor(Math.random() * articleTypes.length)];
    article.Slug = faker.helpers.slugify(faker.lorem.words(3)).toLowerCase();
    article.Content = faker.lorem.paragraphs(3);

    // Randomly assign 2-5 tags
    const numTags = Math.floor(Math.random() * 4) + 2;
    article.Tags = [];
    const shuffledTags = [...availableTags].sort(() => Math.random() - 0.5);
    for (let j = 0; j < numTags && j < shuffledTags.length; j++) {
      article.Tags.push(shuffledTags[j]);
    }

    // Random date within the last year
    article.PublishedAt = faker.date.past(1);
    article.UpdatedAt = faker.date.between(article.PublishedAt, new Date());

    articles.push(article);
  }

  await articleRepository.save(articles);
  console.log(`✓ Seeded ${articles.length} articles`);
  return articles;
}
