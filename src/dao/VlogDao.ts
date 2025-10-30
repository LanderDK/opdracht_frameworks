import { AppDataSource } from "../data/data-source";
import { Vlog } from "../data/entity/Vlog";
import { Article } from "../data/entity/Article";
import { VideoFile } from "../data/entity/VideoFile";

export class VlogDAO {
  constructor(protected ds = AppDataSource) {}

  async findAll(): Promise<Vlog[]> {
    return this.ds.getRepository(Vlog).find({ relations: ["VideoFile"] });
  }

  async findById(id: number): Promise<Vlog | null> {
    return this.ds.getRepository(Vlog).findOne({ where: { ArticleId: id }, relations: ["VideoFile"] });
  }

  /**
   * Create a vlog: create Article row first, optionally create VideoFile, then Vlog row
   * payload.article - fields for the Article row
   * payload.videoFile - optional VideoFile data; if provided a VideoFile row will be created and referenced
   */
  async create(payload: Partial<Vlog> & { videoFile?: Partial<VideoFile> }): Promise<Vlog> {
    return this.ds.manager.transaction(async (manager) => {
      const vlogRepo = manager.getRepository(Vlog);
      const videoRepo = manager.getRepository(VideoFile);

      let savedVideo: VideoFile | undefined;
      if (payload.videofile) {
        const vf = videoRepo.create(payload.videofile);
        savedVideo = await videoRepo.save(vf);
      }

      const vlog = vlogRepo.create({ ...payload, VideoFileId: savedVideo?.VideoFileId });
      vlog.PublishedAt = vlog.PublishedAt ?? new Date();
      // TypeORM will automatically create both Article and Vlog rows
      return vlogRepo.save(vlog);
    });
  }

  async update(id: number, patch: Partial<Vlog>): Promise<Vlog | null> {
    const repo = this.ds.getRepository(Vlog);
    const vlog = await repo.findOneBy({ ArticleId: id });
    if (!vlog) return null;
    vlog.UpdatedAt = new Date();
    repo.merge(vlog, patch);
    return repo.save(vlog);
  }

  async delete(id: number): Promise<boolean> {
    const repo = this.ds.getRepository(Vlog);
    const vlog = await repo.findOneBy({ ArticleId: id });
    if (!vlog) return false;
    // TypeORM will handle cascade delete for child table rows
    await repo.remove(vlog);
    return true;
  }
}
