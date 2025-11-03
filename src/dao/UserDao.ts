import { Repository, FindManyOptions } from "typeorm";
import AppDataSource from "../data/data-source";
import User from "../data/entity/User";

export default class UserDAO {
  protected repo: Repository<User>;

  constructor(protected ds = AppDataSource) {
    this.repo = this.ds.getRepository(User);
  }

  async findById(
    id: number,
    options?: FindManyOptions<User>
  ): Promise<User | null> {
    return this.repo.findOne({
      where: { UserId: id },
      ...options,
    });
  }

  async create(payload: Partial<User>): Promise<User> {
    const user = this.repo.create(payload);
    return this.repo.save(user);
  }

  async update(id: number, patch: Partial<User>): Promise<User | null> {
    const user = await this.repo.findOne({ where: { UserId: id } });
    if (!user) return null;

    Object.assign(user, patch);
    return this.repo.save(user);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete({ UserId: id });
    return result.affected !== 0;
  }
}
