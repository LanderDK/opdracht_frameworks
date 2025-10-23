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
    console.log("Creating ArticleDao instance...");
    const articleDao = new (await import("./dao/articleDao")).ArticleDAO(
      AppDataSource
    );

    console.log("Filtering articles by tag 'technology'...");
    const techArticles = await articleDao.filterByTag("technology");
    console.log("Articles with tag 'technology': ", techArticles);

    console.log("Creating a new article...");
    const newArticle = await articleDao.create({    
      Excerpt: "An article about the latest trends in technology.",
      ArticleType: "Blog",
      Content: "Content about the latest in technology...",
      Slug: "new-tech-trends",
      Tags: ["technology", "innovation"],
    });
    console.log("Created Article: ", newArticle);

    console.log("Updating the article...");
    const updatedArticle = await articleDao.update(newArticle.ArticleId, {
      Excerpt: "An updated article about the latest trends in technology.",
    });
    console.log("Updated Article: ", updatedArticle);

    console.log("Deleting the article...");
    const deleteResult = await articleDao.delete(newArticle.ArticleId);
    console.log(
      `Article deletion ${deleteResult ? "succeeded" : "failed"}.`
    );

  })
  .catch((error) => console.log(error));
