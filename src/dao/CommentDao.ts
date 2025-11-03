import { Repository, FindManyOptions } from "typeorm";
import AppDataSource from "../data/data-source";
import Comment from "../data/entity/Comment";

export default class CommentDAO {
  protected repo: Repository<Comment>;

  constructor(protected ds = AppDataSource) {
    this.repo = this.ds.getRepository(Comment);
  }

  async findAllByArticleId(
    articleId: number,
    options?: FindManyOptions<Comment>
  ): Promise<Comment[]> {
    return this.repo.find({
      where: { ArticleId: articleId },
      ...options,
    });
  }

  async create(payload: Partial<Comment>): Promise<Comment> {
    const comment = this.repo.create({
      ...payload,
      PublishedAt: new Date(),
    });
    const savedComment = await this.repo.save(comment);

    // Fetch the comment with User relation (eager loaded)
    const commentWithUser = await this.repo.findOne({
      where: { CommentId: savedComment.CommentId },
    });

    return commentWithUser!;
  }

  async update(id: number, patch: Partial<Comment>): Promise<Comment | null> {
    const comment = await this.repo.findOne({ where: { CommentId: id } });
    if (!comment) return null;

    Object.assign(comment, patch);
    return this.repo.save(comment);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete({ CommentId: id });
    return result.affected !== 0;
  }
}
