import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog & Vlog API",
      version: "1.0.0",
      description:
        "REST API for managing blogs, vlogs, articles, comments and users. Supports real-time comments via WebSocket.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:9000",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Articles",
        description: "General article operations (both blogs and vlogs)",
      },
      {
        name: "Blogs",
        description: "Blog-specific operations",
      },
      {
        name: "Vlogs",
        description: "Vlog-specific operations",
      },
      {
        name: "Comments",
        description: "Comment operations for articles",
      },
      {
        name: "Users",
        description: "User management operations",
      },
    ],
    components: {
      schemas: {
        Article: {
          type: "object",
          properties: {
            ArticleId: {
              type: "integer",
              description: "The auto-generated id of the article",
            },
            Title: {
              type: "string",
              description: "Article title",
            },
            Content: {
              type: "string",
              description: "Article content",
            },
            Excerpt: {
              type: "string",
              description: "Short excerpt of the article",
            },
            PublishedAt: {
              type: "string",
              format: "date-time",
              description: "Publication date",
            },
            Tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Article tags",
            },
            ArticleType: {
              type: "string",
              enum: ["Blog", "Vlog"],
              description: "Type of article",
            },
          },
        },
        Blog: {
          allOf: [
            { $ref: "#/components/schemas/Article" },
            {
              type: "object",
              properties: {
                Readtime: {
                  type: "integer",
                  description: "Estimated reading time in minutes",
                },
              },
            },
          ],
        },
        BlogInput: {
          type: "object",
          required: ["Title", "Content", "Excerpt", "Tags"],
          properties: {
            Title: {
              type: "string",
              minLength: 3,
              maxLength: 200,
              description: "Blog title",
              example: "Getting Started with TypeORM",
            },
            Content: {
              type: "string",
              minLength: 10,
              description: "Blog content",
              example: "TypeORM is a powerful ORM for TypeScript...",
            },
            Excerpt: {
              type: "string",
              minLength: 5,
              maxLength: 500,
              description: "Short excerpt",
              example: "Learn the basics of TypeORM",
            },
            Tags: {
              type: "array",
              items: {
                type: "string",
              },
              minItems: 1,
              description: "Blog tags",
              example: ["typescript", "database", "orm"],
            },
            Readtime: {
              type: "integer",
              minimum: 1,
              description: "Estimated reading time in minutes",
              example: 5,
            },
          },
        },
        Vlog: {
          allOf: [
            { $ref: "#/components/schemas/Article" },
            {
              type: "object",
              properties: {
                VideoFile: {
                  $ref: "#/components/schemas/VideoFile",
                },
              },
            },
          ],
        },
        VlogInput: {
          type: "object",
          required: ["Title", "Content", "Excerpt", "Tags", "VideoFile"],
          properties: {
            Title: {
              type: "string",
              minLength: 1,
              maxLength: 200,
              description: "Vlog title",
              example: "My First Vlog",
            },
            Content: {
              type: "string",
              minLength: 1,
              description: "Vlog content",
              example: "This is the content of my vlog...",
            },
            Excerpt: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              description: "Short excerpt",
              example: "A quick introduction to my vlog",
            },
            Slug: {
              type: "string",
              maxLength: 255,
              description: "URL slug (optional)",
              example: "my-first-vlog",
            },
            Tags: {
              type: "array",
              items: {
                type: "string",
                maxLength: 50,
              },
              description: "Vlog tags",
              example: ["vlog", "tutorial", "video"],
            },
            VideoFile: {
              type: "object",
              required: ["VideoFileUrl"],
              properties: {
                VideoFileUrl: {
                  type: "string",
                  format: "uri",
                  description: "URL to the video file",
                  example: "https://example.com/videos/my-vlog.mp4",
                },
              },
            },
          },
        },
        VideoFile: {
          type: "object",
          properties: {
            VideoFileId: {
              type: "integer",
              description: "The auto-generated id of the video file",
            },
            VideoFileUrl: {
              type: "string",
              format: "uri",
              description: "URL to the video file",
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            CommentId: {
              type: "integer",
              description: "The auto-generated id of the comment",
            },
            Content: {
              type: "string",
              description: "Comment content",
            },
            PublishedAt: {
              type: "string",
              format: "date-time",
              description: "Comment publication date",
            },
            User: {
              $ref: "#/components/schemas/User",
            },
            ArticleId: {
              type: "integer",
              description: "ID of the article this comment belongs to",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            UserId: {
              type: "integer",
              description: "The auto-generated id of the user",
            },
            Username: {
              type: "string",
              description: "Username",
            },
            Email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Error code",
            },
            message: {
              type: "string",
              description: "Error message",
            },
            details: {
              type: "object",
              description: "Additional error details",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
