import { AppDataSource } from "../data-source";
import { Vlog } from "../entity/Vlog";
import { Article } from "../entity/Article";
import { VideoFile } from "../entity/VideoFile";

export class VlogDAO {
  constructor(protected ds = AppDataSource) {}

  async findAll(): Promise<Vlog[]> {
    return this.ds.getRepository(Vlog).find({ relations: ["videofile"] });
  }

  async findById(id: number): Promise<Vlog | null> {
    return this.ds.getRepository(Vlog).findOne({ where: { VlogId: id }, relations: ["videofile"] });
  }

  /**
   * Create a vlog: create Article row first, optionally create VideoFile, then Vlog row
   * payload.article - fields for the Article row
   * payload.videoFile - optional VideoFile data; if provided a VideoFile row will be created and referenced
   */
  async create(payload: Partial<Vlog> & { article?: Partial<Article>; videoFile?: Partial<VideoFile> }): Promise<Vlog> {
    return this.ds.manager.transaction(async (manager) => {
      const articleRepo = manager.getRepository(Article);
      const vlogRepo = manager.getRepository(Vlog);
      const videoRepo = manager.getRepository(VideoFile);

      const articlePayload = payload.article ?? {};
      const article = articleRepo.create(articlePayload);
      article.PublishedAt = article.PublishedAt ?? new Date();
      const savedArticle = await articleRepo.save(article);

      let savedVideo: VideoFile | undefined;
      if (payload.videoFile) {
        const vf = videoRepo.create(payload.videoFile);
        savedVideo = await videoRepo.save(vf);
      }

      const vlog = vlogRepo.create({ ...payload, VlogId: savedArticle.ArticleId, VideoFileId: savedVideo?.VideoFileId });
      return vlogRepo.save(vlog);
    });
  }

  async update(id: number, patch: Partial<Vlog>): Promise<Vlog | null> {
    const repo = this.ds.getRepository(Vlog);
    const vlog = await repo.findOneBy({ VlogId: id });
    if (!vlog) return null;
    repo.merge(vlog, patch);
    return repo.save(vlog);
  }

  async delete(id: number): Promise<boolean> {
    return this.ds.manager.transaction(async (manager) => {
      const vlogRepo = manager.getRepository(Vlog);
      const articleRepo = manager.getRepository(Article);

      // Find the vlog with its article relation
      const vlog = await vlogRepo.findOne({ 
        where: { VlogId: id },
        relations: ["article"]
      });
      
      if (!vlog) return false;

      // Delete vlog first (to avoid FK constraint violation)
      await vlogRepo.remove(vlog);

      // Then delete the linked article if it exists
      if (vlog.article) {
        await articleRepo.remove(vlog.article);
      }

      return true;
    });
  }
}
