import { AppDataSource } from "../data/data-source";
import { VideoFile } from "../data/entity/VideoFile";
import { Vlog } from "../data/entity/Vlog";
import { ArticleType } from "../data/enum/ArticleType";

export class VlogDAO {
  protected repo = this.ds.getRepository(Vlog);

  constructor(protected ds = AppDataSource) {}

  async findAll(): Promise<Vlog[]> {
    return this.repo.find(); // Eager loading removed; lazy loading will be used in routes
  }

  async findById(id: number): Promise<Vlog | null> {
    return this.repo.findOne({
      where: { ArticleId: id },
      relations: ["VideoFile"], // dit zorgt ervoor dat de VideoFile ook geladen wordt, hetzelfde als "await vlog.VideoFile" in de route
    });
  }

  async create(
    payload: Partial<Vlog> & { VideoFile?: Partial<VideoFile> }
  ): Promise<Vlog> {
    const repo = this.ds.getRepository(Vlog);
    const repo_vid = this.ds.getRepository(VideoFile);

    if (!payload.VideoFile) {
      throw new Error("VideoFile data is required to create a Vlog");
    }

    // Create and save VideoFile first
    const videoFile = repo_vid.create(payload.VideoFile);
    const savedVideoFile = await repo_vid.save(videoFile);

    // Create Vlog with Article properties (inherited) and VideoFileId
    const vlog = repo.create({
      ...payload,
      ArticleType: ArticleType.VLOG,
      PublishedAt: payload.PublishedAt ?? new Date(),
      UpdatedAt: payload.UpdatedAt ?? new Date(),
      VideoFileId: savedVideoFile.VideoFileId,
    });

    return repo.save(vlog);
  }

  async update(
    id: number,
    patch: Partial<Vlog> & { VideoFile?: Partial<VideoFile> }
  ): Promise<Vlog | null> {
    const repo = this.ds.getRepository(Vlog);
    const repo_vid = this.ds.getRepository(VideoFile);

    // Load vlog with VideoFile relation
    const vlog = await repo.findOne({
      where: { ArticleId: id },
      relations: ["VideoFile"],
    });

    if (!vlog) return null;

    // Update VideoFile if provided
    if (patch.VideoFile && vlog.VideoFile) {
      const videoFile = await vlog.VideoFile; // Lazy load
      Object.assign(videoFile, patch.VideoFile);
      await repo_vid.save(videoFile);
    }

    // Remove VideoFile from patch before updating vlog
    const { VideoFile: _, ...vlogPatch } = patch;

    // Update Vlog (including inherited Article properties)
    Object.assign(vlog, vlogPatch);
    vlog.UpdatedAt = new Date();

    return repo.save(vlog);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete({ ArticleId: id });
    return result.affected !== 0;
  }
}
