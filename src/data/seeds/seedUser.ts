import AppDataSource from "../data-source";
import User from "../entity/User";
import * as faker from "faker";

export default async function seedUsers(count: number = 10): Promise<User[]> {
  const userRepository = AppDataSource.getRepository(User);

  // Check if users already exist
  const existingCount = await userRepository.count();
  if (existingCount > 0) {
    console.log(
      `Users already seeded (${existingCount} users found). Skipping...`
    );
    return await userRepository.find();
  }

  const users: User[] = [];
  const roles = ["admin", "editor", "author", "subscriber"];

  for (let i = 0; i < count; i++) {
    const user = new User();
    user.Username = faker.internet.userName();
    user.Email = faker.internet.email();

    // Randomly assign 1-3 roles
    const numRoles = Math.floor(Math.random() * 3) + 1;
    user.Roles = [];
    for (let j = 0; j < numRoles; j++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      if (!user.Roles.includes(role)) {
        user.Roles.push(role);
      }
    }

    users.push(user);
  }

  await userRepository.save(users);
  console.log(`✓ Seeded ${users.length} users`);
  return users;
}
