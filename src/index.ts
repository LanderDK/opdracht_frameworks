import { Console } from "console";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { Article } from "./entity/Article";

AppDataSource.initialize()
  .then(async () => {
    console.log("Loading users from the database...");
    const users = await AppDataSource.manager.find(User);
    console.log("Loaded users: ", users);

    console.log(
      "Here you can setup and run express / fastify / any other framework."
    );
  }).then(async () => {
    console.log("Creating BlogDao instance...");
    const blogDao = new (await import("./dao/BlogDao")).BlogDAO(
      AppDataSource
    );

    blogDao.findAll().then((blogs) => {
      console.log(`Found ${blogs.length} blogs in the database:`);
      blogs.forEach((blog) => {
        console.log(blog);
      });
    });


  })
  .catch((error) => console.log(error));
