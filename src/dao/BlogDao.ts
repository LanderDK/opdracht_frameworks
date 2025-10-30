import { AppDataSource } from "../data/data-source";
import { Blog } from "../data/entity/Blog";
import { Article } from "../data/entity/Article";
import { FindManyOptions, Repository } from "typeorm";

export class BlogDAO {

    protected repo: Repository<Blog>;
  

  constructor(protected ds = AppDataSource) {
    this.repo = this.ds.getRepository(Blog);
  }

  async findAll(options?: FindManyOptions<Article>): Promise<Blog[]> {
    return this.ds.getRepository(Blog).find();
  }



  async findById(id: number): Promise<Blog | null> {
    return this.ds.getRepository(Blog).findOne({ where: { ArticleId: id }});
  }

  async create(payload: Partial<Blog>): Promise<Blog> {
    const repo = this.ds.getRepository(Blog);
    const repo_art = this.ds.getRepository(Article);
    console.log(payload);
    if (!payload.Article) {
      throw new Error("Article data is required to create a Blog");
    }
    const article = repo_art.create({
    ...payload.Article,
    ArticleType: "blog",
    PublishedAt: payload.Article.PublishedAt ?? new Date(),
    UpdatedAt: payload.Article.UpdatedAt ?? new Date(),
    });
    const savedArticle = await repo_art.save(article);

    const blog = repo.create({
      ArticleId: savedArticle.ArticleId,
      Article: savedArticle,
      Readtime: payload.Readtime,
    });
    return repo.save(blog);
  }

  async update(id: number, patch: Partial<Blog>): Promise<Blog | null> {
    const repo = this.ds.getRepository(Blog);
    const repo_art = this.ds.getRepository(Article);
    
    // Load blog WITH Article data
    const blog = await repo.findOne({ 
        where: { ArticleId: id },
        relations: ['Article']
      });

      if (!blog) return null;
      console.log(patch);
      console.log(patch.Article);
      // Update Article if provided
    if (patch.Article) {
        
        Object.assign(blog.Article, patch.Article);
        blog.Article.UpdatedAt = new Date();
        await repo_art.save(blog.Article);
      }

      // Update Blog fields (not Article)
      if (patch.Readtime !== undefined) {
        blog.Readtime = patch.Readtime;
      }

      return repo.save(blog);
  }

  async delete(id: number): Promise<boolean> {
    const repo = this.ds.getRepository(Blog);
    const repo_art = this.ds.getRepository(Article);
    
    // Load blog to get ArticleId
    const blog = await repo.findOne({ 
      where: { ArticleId: id }
    });
    
    if (!blog) return false;
    
    // Delete Blog first (geen cascade van blog naar article)
    await repo.remove(blog);
    
    // Then delete Article (dit triggert cascade naar andere entities)
    await repo_art.delete(id);
    
    return true;
  }
}
