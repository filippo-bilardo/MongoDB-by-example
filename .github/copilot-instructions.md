# Copilot Instructions for MongoDB by Example

## Project Overview

**MongoDB by Example** is a comprehensive MongoDB course book in Italian for technical school students (TPSIT3). The project contains 7 modules with theoretical guides and practical Docker-based exercises.

- **Target audience**: Italian technical school students (TPSIT3 level)
- **Language**: All content MUST be in Italian
- **Approach**: Didactic-focused with reflection questions, hands-on exercises, and progressive difficulty
- **Repository**: https://github.com/filippo-bilardo/MongoDB-by-example.git

## Project Structure

```
XX-ModuleName/           ← Numbered modules (01-07) with descriptive names
├── XX-CapitoloName.md   ← Numbered chapters (01, 02, ...) - theoretical guides
├── esempi/              ← Code examples for the module
└── esercizi/            ← Practical exercises (Docker-based)
    └── XX-exercise-name/
        ├── docker-compose.yml
        ├── README.md    ← Comprehensive didactic guide
        └── volumes/
```

### Naming Conventions

- **Modules**: `01-Fondamenti`, `02-CRUD`, `03-QueryAvanzate`, etc.
- **Chapters**: `01-Introduzione.md`, `02-Docker.md`, etc.
- **Exercises**: `01-mongodb-nodejs`, `02-primi-passi-mongosh`, etc.
- Use Italian names with hyphens (not underscores or camelCase)

## Module Architecture

### Completed Modules

1. **01-Fondamenti** (4 chapters)
   - MongoDB basics, Docker setup, mongosh commands, Atlas cloud
   - 2 complete exercises with Docker stacks

2. **02-CRUD** (4 chapters)
   - insertOne/Many, find queries, update operations, delete operations
   - No exercises yet

3. **03-QueryAvanzate** (3 chapters)
   - Nested documents, regex/text search, aggregation pipeline
   - No exercises yet

### Planned Modules (not yet created)

4. **04-Schema**: Data modeling and indexes
5. **05-NodeJS**: MongoDB driver integration
6. **06-Mongoose**: ODM (Object Document Mapper)
7. **07-Progetto**: Final project

## Theoretical Guides

### Content Structure

Each chapter guide should include:

1. **Obiettivi del capitolo** - Learning objectives
2. **Theory sections** with numbered headings (##, ###)
3. **Practical examples** with MongoDB shell commands
4. **Code blocks** with proper syntax highlighting (```javascript)
5. **Tables** for operator summaries or comparisons
6. **Real-world examples** (e-commerce, blog, social network, etc.)
7. **Best practices** and performance considerations
8. **Esercizi Pratici** section (optional)
9. **Riepilogo** - Summary of key concepts
10. **Link to next chapter** at the end

### Writing Style

- **Language**: Italian only
- **Tone**: Educational, clear, encouraging
- **Length**: 15-20KB for comprehensive chapters (e.g., 02-Read.md, 03-Aggregation.md)
- **Examples**: Always include practical, runnable MongoDB commands
- **Comparisons**: Frequently compare to SQL/relational databases for clarity
- **Formatting**: 
  - Use ✅ for good practices
  - Use ❌ for anti-patterns
  - Use **bold** for important terms
  - Use `code` for commands and field names

## Exercise Structure

Exercises are Docker-based practical labs with comprehensive didactic README files.

### Exercise README Requirements

1. **🎓 Obiettivi Didattici** - Learning objectives (Bloom's Taxonomy)
2. **📋 Modalità di Consegna** - Google Doc submission requirements
3. **Application description** - What the student will build
4. **🏗️ Architettura** - Docker services diagram
5. **Detailed step-by-step instructions** with:
   - **📸 SCREENSHOT N** markers (30+ per exercise)
   - **❓ Domande di Riflessione** sections (65+ questions per exercise)
6. **📝 Google Doc Template** - Complete submission structure
7. **💯 Rubrica di Valutazione** - Grading rubric (60-100% scale)
8. **🚀 Sfide Opzionali** - Advanced challenges for extra credit

### Exercise Characteristics

- **Not mechanical**: Students must understand, not just execute
- **Reflection-based**: Questions stimulate critical thinking (❓ marker)
- **Documentation-focused**: Screenshot requirements ensure engagement (📸 marker)
- **Progressive difficulty**: Start simple, build complexity
- **Time estimates**: 8-22 hours depending on complexity

### Docker Stack Patterns

**Exercise 01 - Full-stack** (Complex):
```yaml
services:
  mongodb:      # MongoDB 7.0, port 27017
  nodejs-app:   # Node.js 20-alpine, port 3000, depends_on mongodb health
  mongo-express: # GUI, port 8081
```

**Exercise 02 - MongoDB Shell** (Simple):
```yaml
services:
  mongodb:       # MongoDB 7.0, port 27017
  mongo-express: # GUI, port 8081
```

### Docker Best Practices

- Use **health checks** for MongoDB before dependent services start
- Mount **volumes** for data persistence: `./volumes/mongo-data:/data/db`
- Use **init scripts** in `/docker-entrypoint-initdb.d/` (runs once on first start)
- Always include `.env.example` (never commit real `.env`)
- Include `.gitignore` for `node_modules/`, `mongo-data/`, `.env`

## MongoDB Conventions

### Code Examples

```javascript
// Always use proper syntax
db.collection.insertOne({ campo: "valore" })

// Include comments in Italian
// Cerca tutti i documenti con età >= 18
db.utenti.find({ età: { $gte: 18 } })

// Show both command and expected output
db.libri.countDocuments()
// Output: 42
```

### Query Patterns

- **Basic queries**: Use `find()`, `findOne()`, comparison operators
- **Array queries**: `$in`, `$all`, `$elemMatch`, `$size`
- **Nested documents**: Dot notation `"address.city"`
- **Text search**: Text indexes with `$text` operator
- **Aggregation**: Pipeline with stages `$match`, `$group`, `$project`, etc.

### Technical Details

- **MongoDB version**: 7.0 (current stable)
- **Node.js version**: 20-alpine (for exercises)
- **Driver**: Native `mongodb` driver (not Mongoose in exercises 01-02)
- **Document limit**: 16MB per document
- **Pipeline RAM limit**: 100MB per stage (use `allowDiskUse: true` if needed)

## Working with This Repository

### Creating New Chapters

1. Follow the numbering: `03-QueryAvanzate/04-NextTopic.md`
2. Use existing chapters as templates (especially `02-CRUD/02-Read.md`, `03-QueryAvanzate/03-Aggregation.md`)
3. Include 10-15 main sections with practical examples
4. Length: 15-20KB for comprehensive coverage
5. Always link to next chapter at the end

### Creating New Exercises

1. Create in appropriate module's `esercizi/` folder
2. Number sequentially: `01-exercise-name`, `02-exercise-name`
3. Include complete Docker stack with docker-compose.yml
4. README must be 1500-2000 lines with didactic structure
5. Add 65+ reflection questions (❓) and 30+ screenshot markers (📸)
6. Include Google Doc template and grading rubric
7. Test the Docker stack before committing

### Updating README.md

When adding chapters, update the main README.md:
- Keep module numbering consistent (1-20 chapters across 7 modules)
- Update "Stato del Progetto" section with completion status
- Maintain the TODO section

## Git Workflow

### Commit Messages

Use descriptive commit messages in Italian with the Co-authored-by trailer:

```
Aggiungi capitolo XX - Topic Name

- Detailed bullet points of what was added
- Include file sizes for large chapters
- Mention key features or sections

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

### Before Committing

- Verify all content is in Italian
- Test Docker stacks if modified
- Check markdown formatting
- Ensure links work (relative paths)
- Update README.md if structure changed

## Key Patterns to Follow

### When Creating Theoretical Content

- Start with clear learning objectives
- Progress from simple to complex
- Include real-world examples (e-commerce, social networks, schools)
- Show both correct and incorrect patterns (✅/❌)
- End with summary and link to next chapter
- Length: aim for 15-20KB for comprehensive topics

### When Creating Exercises

- Focus on **learning**, not just completion
- Include **reflection questions** that require critical thinking
- Require **screenshot documentation** at key steps
- Provide **grading rubric** with transparent criteria
- Add **optional challenges** for advanced students
- Test the full Docker stack before finalizing

### When Writing in Italian

- Use formal "you" (Lei) sparingly, prefer imperative or infinitive
- Technical terms: Use Italian when possible, English in `code` otherwise
- Examples: "ad esempio", "per esempio" (not "e.g.")
- Lists: Use numbered lists for sequential steps, bullets for feature lists
- Questions: Start with verbs (Confronta, Spiega, Elenca, Analizza)

## Troubleshooting Common Issues

### Docker Volumes Permission Errors

MongoDB data volumes may have permission issues. In `.gitignore`:
```
volumes/mongo-data/
```

### Health Checks Not Working

MongoDB health check requires mongosh (not mongo):
```yaml
healthcheck:
  test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### Init Scripts Not Running

MongoDB init scripts in `/docker-entrypoint-initdb.d/` only run on **first** container start. To re-run:
```bash
docker compose down -v  # Remove volumes
docker compose up -d    # Restart fresh
```

## Reference Files

- **Best theoretical guide example**: `02-CRUD/02-Read.md` (18KB, most comprehensive)
- **Best aggregation example**: `03-QueryAvanzate/03-Aggregation.md` (20KB)
- **Best exercise example**: `01-Fondamenti/esercizi/01-mongodb-nodejs/README.md` (1953 lines)
- **Simplified exercise pattern**: `01-Fondamenti/esercizi/02-primi-passi-mongosh/` (MongoDB Shell only)
