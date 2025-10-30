import { AppDataSource } from "../data/data-source";
import { Vlog } from "../data/entity/Vlog";
import { Article } from "../data/entity/Article";
import { VideoFile } from "../data/entity/VideoFile";

export class VlogDAO {
  constructor(protected ds = AppDataSource) {}

  async findAll(): Promise<Vlog[]> {
    return this.ds.getRepository(Vlog).find({ relations: ["videofile"] });
  }

  async findById(id: number): Promise<Vlog | null> {
    return this.ds
      .getRepository(Vlog)
      .findOne({ where: { VlogId: id }, relations: ["videofile"] });
  }

  /**
   * Create a vlog: create Article row first, optionally create VideoFile, then Vlog row
   * payload.article - fields for the Article row
   * payload.videoFile - optional VideoFile data; if provided a VideoFile row will be created and referenced
   */
  async create(
    payload: Partial<Vlog> & {
      article?: Partial<Article>;
    }
  ): Promise<Vlog> {
    return this.ds.manager.transaction(async (manager) => {
      const articleRepo = manager.getRepository(Article);
      const vlogRepo = manager.getRepository(Vlog);
      const videoRepo = manager.getRepository(VideoFile);

      const articlePayload = payload.article ?? {};
      const article = articleRepo.create(articlePayload);
      article.PublishedAt = article.PublishedAt ?? new Date();
      const savedArticle = await articleRepo.save(article);

      let savedVideo: VideoFile | undefined;
      if (payload.videofile) {
        const vf = videoRepo.create(payload.videofile);
        savedVideo = await videoRepo.save(vf);
      }

      const vlog = vlogRepo.create({
        ...payload,
        VlogId: savedArticle.ArticleId,
        VideoFileId: savedVideo?.VideoFileId,
      });
      return vlogRepo.save(vlog);
    });
  }

  async update(
    id: number,
    patch: Partial<Vlog> & {
      article?: Partial<Article>;
      videofile?: Partial<VideoFile>;
    }
  ): Promise<Vlog | null> {
    return this.ds.manager.transaction(async (manager) => {
      const vlogRepo = manager.getRepository(Vlog);
      const articleRepo = manager.getRepository(Article);
      const videoRepo = manager.getRepository(VideoFile);

      // Find the vlog with its article and videofile relations
      const vlog = await vlogRepo.findOne({
        where: { VlogId: id },
        relations: ["article", "videofile"],
      });

      if (!vlog) return null;

      // Update the article if article data is provided
      if (patch.article && vlog.article) {
        patch.article.UpdatedAt = new Date();
        articleRepo.merge(vlog.article, patch.article);
        await articleRepo.save(vlog.article);
      }

      // Update the videofile if videofile data is provided
      if (patch.videofile && vlog.videofile) {
        videoRepo.merge(vlog.videofile, patch.videofile);
        await videoRepo.save(vlog.videofile);
      }

      // Remove article and videofile from patch before merging into vlog
      const { article, videofile, ...vlogPatch } = patch;

      // Update the vlog properties
      vlogRepo.merge(vlog, vlogPatch);
      return vlogRepo.save(vlog);
    });
  }

  async delete(id: number): Promise<boolean> {
    return this.ds.manager.transaction(async (manager) => {
      const vlogRepo = manager.getRepository(Vlog);
      const articleRepo = manager.getRepository(Article);

      // Find the vlog with its article relation
      const vlog = await vlogRepo.findOne({
        where: { VlogId: id },
        relations: ["article"],
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
