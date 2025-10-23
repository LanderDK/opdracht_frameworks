import { AppDataSource } from "../data-source";
import { UserArticle } from "../entity/UserArticle";
import { User } from "../entity/User";
import { Article } from "../entity/Article";

export async function seedUserArticles(
  count: number = 30
): Promise<UserArticle[]> {
  const userArticleRepository = AppDataSource.getRepository(UserArticle);
  const userRepository = AppDataSource.getRepository(User);
  const articleRepository = AppDataSource.getRepository(Article);

  // Check if user-article relationships already exist
  const existingCount = await userArticleRepository.count();
  if (existingCount > 0) {
    console.log(
      `User-Article relationships already seeded (${existingCount} relationships found). Skipping...`
    );
    return await userArticleRepository.find();
  }

  const users = await userRepository.find();
  const articles = await articleRepository.find();

  if (users.length === 0) {
    console.log("No users found to create user-article relationships");
    return [];
  }

  if (articles.length === 0) {
    console.log("No articles found to create user-article relationships");
    return [];
  }

  const userArticles: UserArticle[] = [];
  const existingPairs = new Set<string>();

  let attempts = 0;
  const maxAttempts = count * 3; // Prevent infinite loop

  while (userArticles.length < count && attempts < maxAttempts) {
    attempts++;

    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomArticle = articles[Math.floor(Math.random() * articles.length)];
    const pairKey = `${randomUser.UserId}-${randomArticle.ArticleId}`;

    // Ensure unique pairs
    if (!existingPairs.has(pairKey)) {
      const userArticle = new UserArticle();
      userArticle.UserId = randomUser.UserId;
      userArticle.ArticleId = randomArticle.ArticleId;
      userArticles.push(userArticle);
      existingPairs.add(pairKey);
    }
  }

  await userArticleRepository.save(userArticles);
  console.log(`✓ Seeded ${userArticles.length} user-article relationships`);
  return userArticles;
}
