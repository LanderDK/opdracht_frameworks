import { AppDataSource } from "../data-source";
import { Comment } from "../entity/Comment";
import { User } from "../entity/User";
import { Article } from "../entity/Article";
import * as faker from "faker";

export async function seedComments(count: number = 50): Promise<Comment[]> {
  const commentRepository = AppDataSource.getRepository(Comment);
  const userRepository = AppDataSource.getRepository(User);
  const articleRepository = AppDataSource.getRepository(Article);

  // Check if comments already exist
  const existingCount = await commentRepository.count();
  if (existingCount > 0) {
    console.log(
      `Comments already seeded (${existingCount} comments found). Skipping...`
    );
    return await commentRepository.find();
  }

  const users = await userRepository.find();
  const articles = await articleRepository.find();

  if (users.length === 0) {
    console.log("No users found to create comments");
    return [];
  }

  if (articles.length === 0) {
    console.log("No articles found to create comments");
    return [];
  }

  const comments: Comment[] = [];

  for (let i = 0; i < count; i++) {
    const comment = new Comment();
    comment.Content = faker.lorem.sentences(Math.floor(Math.random() * 3) + 1);
    comment.PublishedAt = faker.date.past(0.5); // Within last 6 months

    // Randomly assign a user and article
    comment.UserId = users[Math.floor(Math.random() * users.length)].UserId;
    comment.ArticleId =
      articles[Math.floor(Math.random() * articles.length)].ArticleId;

    comments.push(comment);
  }

  await commentRepository.save(comments);
  console.log(`✓ Seeded ${comments.length} comments`);
  return comments;
}
