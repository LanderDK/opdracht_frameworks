import { AppDataSource } from "../data/data-source";
import { Article } from "../data/entity/Article";
import { Vlog } from "../data/entity/Vlog";

export class VlogDAO {
  constructor(protected ds = AppDataSource) {}

  async findAll(): Promise<Vlog[]> {
    return this.ds.getRepository(Vlog).find({ relations: ["Article"] });
  }

  async findById(id: number): Promise<Vlog | null> {
    return this.ds
      .getRepository(Vlog)
      .findOne({ where: { ArticleId: id }, relations: ["Article"] });
  }

  async create(payload: Partial<Vlog>): Promise<Vlog> {
    const repo = this.ds.getRepository(Vlog);
    const repo_art = this.ds.getRepository(Article);

    if (!payload.Article) {
      throw new Error("Article data is required to create a Vlog");
    }

    const article = repo_art.create({
      ...payload.Article,
      PublishedAt: payload.Article.PublishedAt ?? new Date(),
      UpdatedAt: payload.Article.UpdatedAt ?? new Date(),
    });
    const savedArticle = await repo_art.save(article);

    const vlog = repo.create({
      ArticleId: savedArticle.ArticleId,
      Article: savedArticle,
      VideoFile: payload.VideoFile,
    });
    return repo.save(vlog);
  }

  async update(id: number, patch: Partial<Vlog>): Promise<Vlog | null> {
    const repo = this.ds.getRepository(Vlog);
    const repo_art = this.ds.getRepository(Article);

    // Load blog WITH Article data
    const blog = await repo.findOne({
      where: { ArticleId: id },
      relations: ["Article"],
    });

    if (!blog) return null;

    // Update Article if provided
    if (patch.Article) {
      Object.assign(blog.Article, patch.Article);
      blog.Article.UpdatedAt = new Date();
      await repo_art.save(blog.Article);
    }

    // Update Vlog fields (not Article)
    if (patch.VideoFile !== undefined) {
      blog.VideoFile = patch.VideoFile;
    }

    return repo.save(blog);
  }

  async delete(id: number): Promise<boolean> {
    const repo = this.ds.getRepository(Vlog);
    const repo_art = this.ds.getRepository(Article);

    // Load blog to get ArticleId
    const vlog = await repo.findOne({
      where: { ArticleId: id },
    });

    if (!vlog) return false;

    // Delete Blog first (geen cascade van blog naar article)
    await repo.remove(vlog);

    // Then delete Article (dit triggert cascade naar andere entities)
    await repo_art.delete(id);

    return true;
  }
}
