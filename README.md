# Groepsopdracht frameworks voor serverapplicaties

Groep: 29
Studenten: Lander De Kesel & Jason De Ridder

## Beschrijving

Dit project is een webplatform voor het publiceren van blogs en vlogs. Makers kunnen artikelen en video's delen, en bezoekers kunnen reacties plaatsen die direct in beeld verschijnen. Het doel is om content gemakkelijk te beheren en interactie tussen makers en publiek te stimuleren.

## Voldoen aan Project Requirements

### 1. Datalaag met DAO-objecten

Het project bevat meerdere DAO-objecten voor het beheren van de datalaag:

- **ArticleDAO** (`src/dao/ArticleDao.ts`): Opvragen, toevoegen, aanpassen en verwijderen van artikelen
- **BlogDAO** (`src/dao/BlogDao.ts`): CRUD-operaties voor blogs
- **VlogDAO** (`src/dao/VlogDao.ts`): CRUD-operaties voor vlogs
- **CommentDAO** (`src/dao/CommentDao.ts`): Beheer van comments
- **UserDAO** (`src/dao/UserDao.ts`): Gebruikersbeheer
- **UserArticleDAO** (`src/dao/UserArticleDao.ts`): Beheer van n-n relatie tussen gebruikers en artikelen

Elk DAO-object biedt standaard methoden zoals `findAll()`, `findById()`, `create()`, `update()`, en `delete()`.

### 2. Relaties in de datalaag

De datalaag bevat alle gevraagde relatietypes:

**1-1 relatie:**

- `Vlog` <-> `VideoFile`: Eén vlog heeft precies één videobestand
  - **Met cascade**: `onDelete: "CASCADE"` in `Vlog` entity zorgt ervoor dat het VideoFile automatisch wordt verwijderd bij het verwijderen van een Vlog

**1-n relaties:**

- `Article` <-> `Comment`: Eén artikel heeft meerdere comments
  - **Met cascade**: Comments worden automatisch verwijderd bij het verwijderen van een artikel
- `User` <-> `Comment`: Eén gebruiker kan meerdere comments plaatsen
  - **Met cascade**: Comments worden automatisch verwijderd bij het verwijderen van een gebruiker

**n-n relatie:**

- `User` <-> `Article` via `UserArticle`: Gebruikers kunnen meerdere artikelen lezen/opslaan en artikelen kunnen door meerdere gebruikers bekeken worden
  - Implementatie via junction table `UserArticle` (`src/data/entity/UserArticle.ts`)
  - **Zonder cascade**: Verwijderen van een gebruiker zorgt niet voor verwijdering van artikelen, want een artikel kan door meerdere gebruikers geschreven zijn

### 3. Overerving in de datalaag

Het project maakt gebruik van **Single Table Inheritance** met TypeORM:

- **Basis entity**: `Article` (`src/data/entity/Article.ts`)

  - Bevat gemeenschappelijke velden: `ArticleId`, `Title`, `Content`, `Excerpt`, `PublishedAt`, `Tags`
  - Discriminator kolom: `ArticleType` (enum: "Blog" of "Vlog")

- **Afgeleide entities**:
  - `Blog` extends `Article`: Voegt `Readtime` veld toe
  - `Vlog` extends `Article`: Voegt `VideoFile` relatie toe

Deze implementatie zorgt voor code reuse en een duidelijke hiërarchie in de datastructuur.

### 4. Toevoegen van objecten

**Enkel object toevoegen:**

- Alle DAO's hebben een `create()` methode voor het toevoegen van één object
- Voorbeelden:

  ```typescript
  // Één blog toevoegen via POST /api/blogs
  blogDao.create({ Title: "...", Content: "...", ... })

  // Één comment toevoegen via POST /api/articles/:id/comments
  commentDao.create({ UserId: 1, Content: "...", ArticleId: 1 })
  ```

**Verzameling objecten toevoegen (bulk insert):**

- BlogDAO en VlogDAO hebben `createBulk()` methodes
- Implementatie:

  ```typescript
  // Meerdere blogs toevoegen via POST /api/blogs (array body)
  blogDao.createBulk([blog1, blog2, blog3]);

  // Meerdere vlogs toevoegen via POST /api/vlogs (array body)
  vlogDao.createBulk([vlog1, vlog2, vlog3]);
  ```

- Zie Swagger documentatie voor voorbeelden van bulk creation

### 5. Objecten opvragen

**Lazy loading (relaties worden niet automatisch geladen):**

- Standaard gedrag in TypeORM
- Voorbeeld: `articleDao.findAll()` laadt alleen article data, geen gerelateerde comments

**Eager loading (relaties worden automatisch geladen):**

- Configuratie via `eager: true` in entity definities
- `Comment` entity laadt automatisch de `User` relatie (`src/data/entity/Comment.ts`)
- Vlog laadt automatisch het `VideoFile` object

**Opvragen met parameters:**

- `findById(id)`: Opvragen op basis van ID
- `findBySlug(slug)`: Opvragen op basis van slug (ArticleDAO)
- `findByTag(tag)`: Filteren op tags met QueryBuilder (ArticleDAO)
  ```typescript
  // GET /api/articles?tag=technology
  articleDao.findByTag("technology");
  ```
- `findAllByArticleId(articleId)`: Comments ophalen voor specifiek artikel

### 6. Objecten aanpassen

Alle DAO's hebben een `update()` methode:

- **BlogDAO**: `update(id, data)` - Update blog met automatische readtime berekening
- **VlogDAO**: `update(id, data)` - Update vlog informatie
- **CommentDAO**: `update(id, data)` - Update comment content
- **UserDAO**: `update(id, data)` - Update gebruikersgegevens

Voorbeelden via REST endpoints:

- `PUT /api/blogs/:id` - Blog aanpassen
- `PUT /api/vlogs/:id` - Vlog aanpassen
- `PUT /api/articles/:articleId/comments/:commentId` - Comment aanpassen

### 7. REST API met "API First Approach"

De volledige datalaag functionaliteit is toegankelijk via REST webservices:

**API Documentatie:**

- Swagger/OpenAPI 3.0 documentatie beschikbaar op `/docs`
- Alle endpoints gedocumenteerd met request/response schemas
- "Try it out" functionaliteit voor direct testen

**REST Endpoints (21 totaal):**

_Articles (3):_

- `GET /api/articles` - Alle artikelen (optioneel tag filter)
- `GET /api/articles/:id` - Artikel op ID
- `GET /api/articles/slug/:slug` - Artikel op slug

_Blogs (5):_

- `GET /api/blogs` - Alle blogs
- `GET /api/blogs/:id` - Blog op ID
- `POST /api/blogs` - Maak blog(s) - single/bulk
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Verwijder blog

_Vlogs (5):_

- `GET /api/vlogs` - Alle vlogs
- `GET /api/vlogs/:id` - Vlog op ID
- `POST /api/vlogs` - Maak vlog(s) - single/bulk
- `PUT /api/vlogs/:id` - Update vlog
- `DELETE /api/vlogs/:id` - Verwijder vlog

_Comments (4):_

- `GET /api/articles/:articleId/comments` - Comments voor artikel
- `POST /api/articles/:articleId/comments` - Maak comment
- `PUT /api/articles/:articleId/comments/:commentId` - Update comment
- `DELETE /api/articles/:articleId/comments/:commentId` - Verwijder comment

_Users (4):_

- `GET /api/users/:id` - Gebruiker op ID
- `POST /api/users` - Maak gebruiker
- `PUT /api/users/:id` - Update gebruiker
- `DELETE /api/users/:id` - Verwijder gebruiker

**Validatie:**

- Alle endpoints hebben Joi validatie schemas
- Request body, query parameters en path parameters worden gevalideerd
- Foutmeldingen geven duidelijke feedback bij validatiefouten

### 8. Webapplicatie met WebSockets

**Node.js Webapplicatie:**

Het project bevat een complete webapplicatie gebouwd met:

- **Express.js** voor server-side routing
- **Pug** templating engine voor HTML rendering
- **Socket.IO** voor real-time WebSocket communicatie

**Gebruik van REST Webservices:**

De webapplicatie maakt gebruik van de REST API voor data ophalen:

- Homepage (`/`): Haalt alle artikelen op via server-side rendering
- Blog detail (`/blogs/:id`): Toont blog met comments
- Vlog detail (`/vlogs/:id`): Toont vlog met video player en comments
- Tag filtering: Client-side filtering via `/api/articles?tag=...`

**WebSocket Implementatie - Real-time Comments:**

De applicatie gebruikt WebSockets voor real-time comment updates:

_Server-side (`src/socket/index.ts`):_

```typescript
// Gebruikers joinen article-specifieke rooms
socket.on('join-article', (articleId) => { ... })

// Nieuwe comment wordt gebroadcast naar alle clients in de room
socket.on('comment:created', (data) => {
  io.to(`article-${articleId}`).emit('comment:new', comment)
})
```

_Client-side (`src/public/js/comments-realtime.js`):_

```javascript
// Join article room bij het openen van een detail pagina
socket.emit('join-article', ARTICLE_ID)

// Luister naar nieuwe comments
socket.on('comment:new', (comment) => {
  addCommentToList(comment) // Voeg toe aan DOM zonder page refresh
})

// Post nieuwe comment via REST API
axios.post('/api/articles/:id/comments', data)
  .then(() => socket.emit('comment:created', ...))
```

**Real-time Functionaliteit:**

- Wanneer een gebruiker een comment post, wordt deze via REST API opgeslagen
- Socket.IO broadcast de nieuwe comment naar alle andere gebruikers die het artikel bekijken
- Comments verschijnen instant zonder page refresh
- Werkt over meerdere browser tabs/vensters heen

**Voordelen van deze aanpak:**

- Server-side rendering voor snelle initial page load en SEO
- Client-side real-time updates voor interactiviteit
- Gescheiden concerns: REST API voor data, WebSockets voor updates
- Schaalbaar: Room-based broadcasting per artikel

## Environmentvariabelen

Er is een .env bestand nodig met enkele ingevulde data, afhankelijk van de installatie bij de gebruiker. Dit ziet er als volgt uit:

```
NODE_ENV={stage} #Example development
PORT={webservice_port number}

# Database
DATABASE_HOST=database # Configuratie variabele uit de docker-compose.yaml file
DATABASE_MYSQL_HOST={ip-adres or localhost} # Configuratie voor de host op de MYSQL container
DATABASE_PORT={port_number}
DATABASE_USERNAME={username}
DATABASE_PASSWORD={password}
DATABASE_NAME={database_name}

# CORS
CORS_ORIGINS={link_for_cors} #Example: http://localhost:3000,http://localhost:3000
CORS_MAX_AGE={number} #example: 600
```

## Zelf starten van de service

Het lokaal uitvoeren van dit project vereist de installatie van Docker (docker desktop op Windows 11!).

Indien de bovenstaande .env correct geconfigureerd is, moet `docker compose up -d` uitgevoerd worden in de command line om de service te starten. Dit zou alle containers in de correcte volgorde moeten starten en de web service beschikbaar maken op de `http://localhost:3000`.

## Testen van de webservice online

De webservice is ook online beschikbaar. Deze is terug te vinden op `http://157.193.171.84:3000/`. Dit is de hoofdpagina van de applicatie. Er is ook een swaggerpagina opgezet. Hier wordt toegelicht hoe al de routes zijn geïmplementeerd en kunnen deze ook getest worden. Deze pagina is te vinden op `http://157.193.171.84:3000/docs`. Er is geen authenticatie voorzien, wat dus wil zeggen dat er bijvoorbeeld bij het posten van comments manueel een userId moet meegegeven worden in de body van het request.
