import { AppDataSource } from "../data/data-source";
import { VideoFile } from "../data/entity/VideoFile";
import { Vlog } from "../data/entity/Vlog";
import { ArticleType } from "../data/enum/ArticleType";

export class VlogDAO {
  protected repoVlog = this.ds.getRepository(Vlog);
  protected repoVideoFile = this.ds.getRepository(VideoFile);

  constructor(protected ds = AppDataSource) {}

  async findAll(): Promise<Vlog[]> {
    return this.repoVlog.find(); // Eager loading removed; lazy loading will be used in routes
  }

  async findById(id: number): Promise<Vlog | null> {
    return this.repoVlog.findOne({
      where: { ArticleId: id },
      relations: ["VideoFile"], // dit zorgt ervoor dat de VideoFile ook geladen wordt, hetzelfde als "await vlog.VideoFile" in de route
    });
  }

  async create(
    payload: Partial<Vlog> & { VideoFile?: Partial<VideoFile> }
  ): Promise<Vlog> {
    // Create and save VideoFile first
    const videoFile = this.repoVideoFile.create(payload.VideoFile);
    const savedVideoFile = await this.repoVideoFile.save(videoFile);

    // Remove VideoFile from payload before creating vlog
    const { VideoFile: _, ...vlogData } = payload;

    // Create Vlog with Article properties (inherited) and VideoFileId
    const vlog = this.repoVlog.create({
      ...vlogData,
      ArticleType: ArticleType.VLOG,
      PublishedAt: vlogData.PublishedAt ?? new Date(),
      UpdatedAt: vlogData.UpdatedAt ?? new Date(),
      VideoFileId: savedVideoFile.VideoFileId,
    });

    return this.repoVlog.save(vlog);
  }

  async update(
    id: number,
    patch: Partial<Vlog> & { VideoFile?: Partial<VideoFile> }
  ): Promise<Vlog | null> {
    // Load vlog with VideoFile relation
    const vlog = await this.repoVlog.findOne({
      where: { ArticleId: id },
      relations: ["VideoFile"],
    });

    if (!vlog) return null;

    // Update VideoFile if provided
    if (patch.VideoFile && vlog.VideoFile) {
      const videoFile = await vlog.VideoFile; // Lazy load
      Object.assign(videoFile, patch.VideoFile);
      await this.repoVideoFile.save(videoFile);
    }

    // Remove VideoFile from patch before updating vlog
    const { VideoFile: _, ...vlogPatch } = patch;

    // Update Vlog (including inherited Article properties)
    Object.assign(vlog, vlogPatch);
    vlog.UpdatedAt = new Date();

    return this.repoVlog.save(vlog);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repoVlog.delete({ ArticleId: id });
    return result.affected !== 0;
  }

  async createBulk(
    payloads: Array<Partial<Vlog> & { VideoFile?: Partial<VideoFile> }>
  ): Promise<Vlog[]> {
    const vlogs: Vlog[] = [];

    for (const payload of payloads) {
      // Create and save VideoFile first
      const videoFile = this.repoVideoFile.create(payload.VideoFile);
      const savedVideoFile = await this.repoVideoFile.save(videoFile);

      // Remove VideoFile from payload before creating vlog
      const { VideoFile: _, ...vlogData } = payload;

      // Create Vlog with Article properties (inherited) and VideoFileId
      const vlog = this.repoVlog.create({
        ...vlogData,
        ArticleType: ArticleType.VLOG,
        PublishedAt: vlogData.PublishedAt ?? new Date(),
        UpdatedAt: vlogData.UpdatedAt ?? new Date(),
        VideoFileId: savedVideoFile.VideoFileId,
      });

      vlogs.push(vlog);
    }

    return this.repoVlog.save(vlogs);
  }
}
