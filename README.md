# MongoDB by Example

## Introduzione

Benvenuti al corso "MongoDB by Example"! Questo corso è progettato per fornire una comprensione pratica di MongoDB attraverso esercitazioni progressive. Partendo dalla installazione e dai primi comandi fino alla integrazione con Node.js e alle tecniche di ottimizzazione, imparerai a usare MongoDB come database per applicazioni web moderne.

MongoDB è un database NoSQL orientato ai documenti: invece di tabelle e righe (come nei database relazionali), i dati vengono memorizzati in **documenti JSON** raggruppati in **collezioni**. Questo modello è flessibile, scalabile e si integra naturalmente con JavaScript e Node.js.

---

## Indice delle Esercitazioni

### Modulo 1 — Fondamenti e installazione

1. [Introduzione a MongoDB](./01-Fondamenti/01-Introduzione.md)
   - Differenze tra database relazionali e NoSQL
   - Il modello a documenti: collezioni, documenti, campi
   - Installazione di MongoDB e MongoDB Shell (`mongosh`)
   - Il client grafico MongoDB Compass

2. [MongoDB con Docker](./01-Fondamenti/02-Docker.md)
   - Installazione di Docker
   - Eseguire MongoDB in un container Docker
   - `docker run` e parametri principali
   - Persistenza dei dati con volumi Docker
   - `docker-compose` per MongoDB
   - Accesso al container e connessione con `mongosh`

3. [Primi passi con `mongosh`](./01-Fondamenti/03-PrimiPassi.md)
   - Connettersi a un'istanza MongoDB
   - Creare e selezionare un database: `use nomeDb`
   - Creare una collezione e inserire documenti: `insertOne`, `insertMany`
   - Listare database e collezioni: `show dbs`, `show collections`

4. [MongoDB Atlas: Database nel Cloud](./01-Fondamenti/04-Atlas.md)
   - Cos'è MongoDB Atlas e vantaggi del cloud
   - Creare un account e un cluster gratuito (M0)
   - Configurare sicurezza: utenti e IP whitelist
   - Stringa di connessione e connessione con `mongosh`/Compass
   - Funzionalità di monitoring e performance
   - Integrare Atlas con applicazioni

### Modulo 2 — Operazioni CRUD

5. [Create — Inserire documenti](./02-CRUD/01-Create.md)
   - `insertOne` e `insertMany`
   - Struttura di un documento BSON
   - Il campo `_id` e ObjectId
   - Documenti annidati e array

6. [Read — Interrogare i dati](./02-CRUD/02-Read.md)
   - `find` e `findOne`: query di base
   - Operatori di confronto: `$eq`, `$ne`, `$gt`, `$lt`, `$gte`, `$lte`
   - Operatori logici: `$and`, `$or`, `$not`, `$nor`
   - Proiezione: selezionare solo i campi necessari
   - Ordinamento (`sort`), paginazione (`skip`, `limit`)

7. [Update — Aggiornare documenti](./02-CRUD/03-Update.md)
   - `updateOne` e `updateMany`
   - Operatori di aggiornamento: `$set`, `$unset`, `$inc`, `$push`, `$pull`
   - `upsert`: aggiornare o inserire se non esiste
   - `replaceOne`: sostituzione completa di un documento

8. [Delete — Eliminare documenti](./02-CRUD/04-Delete.md)
   - `deleteOne` e `deleteMany`
   - Eliminare una collezione: `drop`
   - Eliminare un database: `dropDatabase`

### Modulo 3 — Query avanzate

8. [Interrogare documenti annidati e array](./03-QueryAvanzate/01-QueryAvanzate/README.md)
   - Dot notation per accedere ai campi annidati
   - Query su array: `$in`, `$nin`, `$all`, `$elemMatch`, `$size`
   - Query su documenti embedded
   - Operatore `$exists` e `$type`

9. [Espressioni regolari e testo](./03-QueryAvanzate/02-Regex-e-Testo/README.md)
   - Ricerca con espressioni regolari: `/pattern/`
   - Indice di testo (`text index`) e operatore `$text`
   - `$search`, `$language`, `$caseSensitive`

10. [Aggregation Pipeline](./03-QueryAvanzate/03-Aggregation/README.md)
   - Concetto di pipeline: stadi sequenziali
   - Stage principali: `$match`, `$project`, `$group`, `$sort`, `$limit`, `$skip`
   - Operatori di raggruppamento: `$sum`, `$avg`, `$min`, `$max`, `$count`
   - Stage avanzati: `$lookup` (join), `$unwind`, `$addFields`

### Modulo 4 — Schema e modellazione dei dati

12. [Modellazione dei dati in MongoDB](./04-Schema/01-Modellazione/README.md)
    - Documenti embedded vs riferimenti (relazioni)
    - Quando usare l'embedding, quando i riferimenti
    - Pattern comuni: one-to-one, one-to-many, many-to-many
    - Validazione dello schema con `$jsonSchema`

13. [Indici e prestazioni](./04-Schema/02-Indici/README.md)
    - Cos'è un indice e perché migliora le query
    - `createIndex`: indici singoli e composti
    - Indici speciali: unico (`unique`), sparse, TTL (scadenza automatica)
    - Analisi delle query con `explain()`

### Modulo 5 — MongoDB con Node.js

14. [Connessione a MongoDB da Node.js](./05-NodeJS/01-Connessione/README.md)
    - Il driver ufficiale `mongodb` (npm)
    - `MongoClient`, connection string, pool di connessioni
    - Gestione degli errori e chiusura della connessione
    - Variabili d'ambiente per le credenziali (`.env`, `dotenv`)

15. [CRUD da Node.js](./05-NodeJS/02-CRUD/README.md)
    - Operazioni CRUD usando il driver Node.js
    - Callback, Promise e `async/await`
    - Gestione degli errori asincroni con `try/catch`
    - Struttura di un modulo di accesso al database (Data Access Layer)

16. [API REST con Express e MongoDB](./05-NodeJS/03-REST-API/README.md)
    - Progettare endpoint CRUD per una risorsa
    - `GET /risorse`, `GET /risorse/:id`, `POST`, `PUT`, `DELETE`
    - Validazione dell'input lato server
    - Risposta con codici HTTP corretti

### Modulo 6 — Mongoose (ODM)

17. [Introduzione a Mongoose](./06-Mongoose/01-Intro/README.md)
    - Cos'è un ODM (Object Document Mapper)
    - Installazione e connessione con Mongoose
    - Definire uno Schema e un Model
    - Tipi di dati, vincoli, valori predefiniti

18. [Operazioni CRUD con Mongoose](./06-Mongoose/02-CRUD/README.md)
    - Creare documenti: `new Model()` e `.save()`, oppure `Model.create()`
    - Leggere: `find`, `findById`, `findOne`
    - Aggiornare: `findByIdAndUpdate`, `findOneAndUpdate`
    - Eliminare: `findByIdAndDelete`, `deleteMany`

19. [Validazione e middleware con Mongoose](./06-Mongoose/03-Avanzato/README.md)
    - Validatori built-in: `required`, `min`, `max`, `enum`, `match`
    - Validatori custom
    - Middleware (hook) `pre` e `post`: `save`, `validate`, `remove`
    - Metodi di istanza e metodi statici su un Model
    - Popolazione di riferimenti con `.populate()`

### Modulo 7 — Progetto finale

20. [Progetto — Applicazione CRUD completa](./07-Progetto/01-Progetto/README.md)
    - Analisi dei requisiti e modellazione dei dati
    - Backend con Express, Mongoose e autenticazione base
    - Frontend con fetch API per consumare le API REST
    - Deploy in un container Docker con `docker-compose`

---

## Come utilizzare questo corso

Ogni modulo è contenuto in una cartella dedicata. All'interno di ogni cartella troverai:
- Un file `README.md` con la descrizione teorica e l'indice degli argomenti
- Una cartella `esempi/` con esempi pratici numerati e commentati
- Una cartella `esercizi/` con la guida alle esercitazioni (senza soluzione diretta)

Si consiglia di seguire i moduli nell'ordine proposto: ogni modulo si basa sui concetti dei precedenti.

## Prerequisiti

- Conoscenze base di JavaScript (variabili, funzioni, array, oggetti)
- Conoscenze base di Node.js (moduli, npm) — moduli 5 e 6
- Docker installato — modulo 7
- MongoDB Compass (facoltativo ma consigliato)

## Risorse

- [Documentazione ufficiale MongoDB](https://www.mongodb.com/docs/)
- [MongoDB University (corsi gratuiti)](https://learn.mongodb.com/)
- [Documentazione Mongoose](https://mongoosejs.com/docs/)
- [MongoDB Compass (GUI)](https://www.mongodb.com/products/tools/compass)

## Stato del Progetto

### Completato ✅
- **Modulo 1 - Fondamenti** (4 capitoli + 2 esercitazioni Docker complete)
- **Modulo 2 - CRUD** (4 capitoli teorici)
- **Modulo 3 - Query Avanzate** (3 capitoli teorici)

### In Sviluppo 🔄
- **Modulo 4 - Schema** (da creare)
- **Modulo 5 - NodeJS** (da creare)
- **Modulo 6 - Mongoose** (da creare)
- **Modulo 7 - Progetto** (da creare)

### Esercitazioni Disponibili
1. **01-mongodb-nodejs** - Full-stack (MongoDB + Node.js + Mongo Express)
   - REST API completa con 8 endpoint
   - Frontend dashboard interattivo
   - 65+ domande di riflessione
   - Valutazione su scala 60-100%

2. **02-primi-passi-mongosh** - MongoDB Shell
   - Focus su comandi mongosh
   - 3 esercizi pratici (Cinema, Scuola, Ristorante)
   - Approccio didattico progressivo

## TODO

- [ ] Completare guide moduli 4-7
- [ ] Aggiungere esercitazioni per moduli 2-7
- [ ] Sezione su transazioni multi-documento
- [ ] Sezione su replica set e sharding
- [ ] Integrazione con framework frontend (React)
- [ ] Glossario dei termini MongoDB vs SQL

