import { AppDataSource } from "../data/data-source";
import { Article } from "../data/entity/Article";
import { VideoFile } from "../data/entity/VideoFile";
import { Vlog } from "../data/entity/Vlog";
import { ArticleType } from "../data/enum/ArticleType";

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
    const repo_vid = this.ds.getRepository(VideoFile);
    console.log("Payload:", payload);

    if (!payload.Article) {
      throw new Error("Article data is required to create a Vlog");
    }

    if (!payload.VideoFile) {
      throw new Error("VideoFile data is required to create a Vlog");
    }

    const videoFile = repo_vid.create(payload.VideoFile);
    const savedVideoFile = await repo_vid.save(videoFile);
    const article = repo_art.create({
      ...payload.Article,
      ArticleType: ArticleType.VLOG,
      PublishedAt: payload.Article.PublishedAt ?? new Date(),
      UpdatedAt: payload.Article.UpdatedAt ?? new Date(),
    });
    const savedArticle = await repo_art.save(article);
    
    const vlog = repo.create({
      VideoFileId: savedVideoFile.VideoFileId,
      ArticleId: savedArticle.ArticleId,
    });
    return repo.save(vlog);
  }

  async update(id: number, patch: Partial<Vlog>): Promise<Vlog | null> {
    const repo = this.ds.getRepository(Vlog);
    const repo_art = this.ds.getRepository(Article);

    // Load vlog WITH Article data
    const vlog = await repo.findOne({
      where: { ArticleId: id },
      relations: ["Article"],
    });
    console.log("Vlog:", vlog);

    if (!vlog) return null;

    // Update Article if provided
    if (patch.Article) {
      Object.assign(vlog.Article, patch.Article);
      vlog.Article.UpdatedAt = new Date();
      await repo_art.save(vlog.Article);
    }
    console.log("Vlog:", vlog);
    return repo.save(vlog);
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
