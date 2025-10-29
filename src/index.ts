import { Console } from "console";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { Article } from "./entity/Article";

// test 2
AppDataSource.initialize()
  .then(async () => {
    console.log("Loading users from the database...");
    const users = await AppDataSource.manager.find(User);
    console.log("Loaded users: ", users);

    console.log(
      "Here you can setup and run express / fastify / any other framework."
      
    );
  })
  .then(async () => {
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
    .then(async () => {
    const blogDao = new (await import("./dao/BlogDao")).BlogDAO(
      AppDataSource
    );

    await blogDao.create({
        article: ({
          ArticleType: "blog",
          Content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          Excerpt: "Short excerpt of the blog article.",
          PublishedAt: new Date(),
          Slug: "test-blog-article",
          Tags: ["test", "blog"],
        } as any),
        // Random read time between 2 and 15 minutes
        readtime: Math.floor(Math.random() * 14) + 2,
    });
    console.log("Blog created successfully!");
  })
  .then(async () => {
    const blogDao = new (await import("./dao/BlogDao")).BlogDAO(
      AppDataSource
    );
    blogDao.findById(11).then((blog) => {
      console.log("Found blog with ID 11:", blog);
    });
  }).then(async () => {
    const blogDao = new (await import("./dao/BlogDao")).BlogDAO(
      AppDataSource
    );
    blogDao.update(11, { readtime: 10 }).then((updatedBlog) => {
      console.log("Updated blog with ID 11:", updatedBlog);
    });
  }).then(async () => {
    const blogDao = new (await import("./dao/BlogDao")).BlogDAO(
      AppDataSource
    );
    blogDao.delete(11).then((deleted) => {
      console.log("Deleted blog with ID 11:", deleted);
    });


  })
  .catch((error) => console.log(error));
