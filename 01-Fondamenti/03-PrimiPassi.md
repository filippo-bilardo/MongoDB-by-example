# Capitolo 3 — Primi passi con `mongosh`

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Connetterti a un'istanza MongoDB locale o remota
- Creare e selezionare database
- Creare collezioni e inserire documenti
- Elencare database e collezioni
- Comprendere la struttura di un documento MongoDB
- Usare i comandi base per esplorare i dati

---

## 1. Avviare MongoDB Shell (`mongosh`)

### 1.1 Connessione locale

Se MongoDB è in esecuzione localmente sulla porta predefinita (27017):

```bash
mongosh
```

Output:

```
Current Mongosh Log ID: 6641f2a3b4c5d6e7f8a9b0c1
Connecting to: mongodb://127.0.0.1:27017/?directConnection=true
Using MongoDB: 7.0.0
Using Mongosh: 2.0.0

For mongosh info see: https://docs.mongodb.com/mongodb-shell/

test>
```

**Nota:** Il prompt `test>` indica che sei connesso al database `test` (database di default).

### 1.2 Connessione con URI

Puoi specificare l'indirizzo completo:

```bash
# Connessione locale con porta specifica
mongosh "mongodb://localhost:27017"

# Connessione remota
mongosh "mongodb://192.168.1.100:27017"

# Connessione con autenticazione
mongosh "mongodb://admin:password@localhost:27017"

# Connessione a un database specifico
mongosh "mongodb://localhost:27017/biblioteca"
```

### 1.3 Connessione con Docker

Se MongoDB è in un container Docker:

```bash
# Metodo 1: Da host (se porta esposta)
mongosh "mongodb://localhost:27017"

# Metodo 2: Dall'interno del container
docker exec -it mio-mongodb mongosh
```

---

## 2. Comandi di navigazione base

### 2.1 Visualizzare i database

```javascript
show dbs
```

Output:

```
admin   40.00 KiB
config  12.00 KiB
local   40.00 KiB
```

**Nota:** Un database appare nell'elenco solo se contiene almeno una collezione con dati.

### 2.2 Selezionare un database

```javascript
use biblioteca
```

Output:

```
switched to db biblioteca
```

**Comportamento:**
- Se il database esiste, ti connetti ad esso
- Se non esiste, verrà creato al primo inserimento di dati

Il prompt cambia:

```
biblioteca>
```

### 2.3 Verificare il database corrente

```javascript
db
```

Output:

```
biblioteca
```

### 2.4 Visualizzare le collezioni

```javascript
show collections
```

Se il database è vuoto, non vedrai output. Altrimenti:

```
libri
autori
prestiti
```

---

## 3. Creare collezioni e inserire documenti

### 3.1 Inserimento implicito di collezione

In MongoDB, **le collezioni vengono create automaticamente** al primo inserimento:

```javascript
db.libri.insertOne({
  titolo: "Il nome della rosa",
  autore: "Umberto Eco",
  anno: 1980,
  genere: "Romanzo storico"
})
```

Output:

```json
{
  "acknowledged": true,
  "insertedId": ObjectId("6641f2a3b4c5d6e7f8a9b0c1")
}
```

**Cosa è successo:**
1. È stato creato il database `biblioteca` (se non esisteva)
2. È stata creata la collezione `libri`
3. È stato inserito un documento con un `_id` generato automaticamente

### 3.2 Verifica

```javascript
show collections
```

Output:

```
libri
```

```javascript
db.libri.find()
```

Output:

```json
{
  "_id": ObjectId("6641f2a3b4c5d6e7f8a9b0c1"),
  "titolo": "Il nome della rosa",
  "autore": "Umberto Eco",
  "anno": 1980,
  "genere": "Romanzo storico"
}
```

---

## 4. Inserire documenti: `insertOne` e `insertMany`

### 4.1 Inserire un singolo documento: `insertOne()`

```javascript
db.libri.insertOne({
  titolo: "1984",
  autore: "George Orwell",
  anno: 1949,
  genere: "Distopia",
  pagine: 328
})
```

### 4.2 Inserire più documenti: `insertMany()`

```javascript
db.libri.insertMany([
  {
    titolo: "Il Signore degli Anelli",
    autore: "J.R.R. Tolkien",
    anno: 1954,
    genere: "Fantasy",
    pagine: 1216
  },
  {
    titolo: "Harry Potter e la pietra filosofale",
    autore: "J.K. Rowling",
    anno: 1997,
    genere: "Fantasy",
    pagine: 223
  },
  {
    titolo: "Orgoglio e pregiudizio",
    autore: "Jane Austen",
    anno: 1813,
    genere: "Romanzo",
    pagine: 432
  }
])
```

Output:

```json
{
  "acknowledged": true,
  "insertedIds": {
    "0": ObjectId("6641f2a3b4c5d6e7f8a9b0c2"),
    "1": ObjectId("6641f2a3b4c5d6e7f8a9b0c3"),
    "2": ObjectId("6641f2a3b4c5d6e7f8a9b0c4")
  }
}
```

---

## 5. Leggere documenti: `find()` e `findOne()`

### 5.1 Visualizzare tutti i documenti

```javascript
db.libri.find()
```

**Formattazione leggibile:**

```javascript
db.libri.find().pretty()
```

> **Nota:** In `mongosh` recente, `.pretty()` è applicato automaticamente.

### 5.2 Trovare un singolo documento

```javascript
db.libri.findOne()
```

Restituisce il primo documento della collezione.

### 5.3 Filtrare i documenti

```javascript
// Trova libri di genere "Fantasy"
db.libri.find({ genere: "Fantasy" })

// Trova libri pubblicati dopo il 1950
db.libri.find({ anno: { $gt: 1950 } })

// Trova un libro specifico per titolo
db.libri.findOne({ titolo: "1984" })
```

---

## 6. Struttura dei documenti

### 6.1 Campo `_id`

Ogni documento ha un campo `_id` univoco:

```javascript
db.libri.insertOne({
  _id: "libro_001",  // _id personalizzato
  titolo: "Il Piccolo Principe",
  autore: "Antoine de Saint-Exupéry"
})
```

**Regole:**
- `_id` deve essere univoco nella collezione
- Se non specifichi `_id`, MongoDB genera un `ObjectId`
- Non puoi modificare `_id` dopo l'inserimento

### 6.2 Documenti annidati

MongoDB supporta documenti annidati (embedded documents):

```javascript
db.libri.insertOne({
  titolo: "Clean Code",
  autore: {
    nome: "Robert",
    cognome: "Martin",
    pseudonimo: "Uncle Bob"
  },
  editore: {
    nome: "Prentice Hall",
    citta: "Upper Saddle River",
    paese: "USA"
  },
  anno: 2008
})
```

### 6.3 Array

I campi possono contenere array:

```javascript
db.libri.insertOne({
  titolo: "Il Signore degli Anelli",
  autore: "J.R.R. Tolkien",
  generi: ["Fantasy", "Avventura", "Epico"],
  lingue_disponibili: ["Italiano", "Inglese", "Francese", "Tedesco"],
  recensioni: [
    { utente: "Mario", voto: 5, commento: "Capolavoro!" },
    { utente: "Laura", voto: 4, commento: "Molto bello ma lungo" }
  ]
})
```

---

## 7. Contare i documenti

```javascript
// Conta tutti i documenti
db.libri.countDocuments()

// Conta documenti filtrati
db.libri.countDocuments({ genere: "Fantasy" })

// Conta documenti con anno > 1950
db.libri.countDocuments({ anno: { $gt: 1950 } })
```

---

## 8. Limitare e ordinare i risultati

### 8.1 Limitare il numero di risultati

```javascript
// Restituisce i primi 3 documenti
db.libri.find().limit(3)
```

### 8.2 Ordinare i risultati

```javascript
// Ordina per anno (crescente)
db.libri.find().sort({ anno: 1 })

// Ordina per anno (decrescente)
db.libri.find().sort({ anno: -1 })

// Ordina per titolo (alfabetico)
db.libri.find().sort({ titolo: 1 })
```

### 8.3 Combinazione

```javascript
// Ultimi 5 libri pubblicati
db.libri.find().sort({ anno: -1 }).limit(5)
```

---

## 9. Proiezione: selezionare campi specifici

Puoi specificare quali campi visualizzare:

```javascript
// Mostra solo titolo e autore (esclude _id)
db.libri.find({}, { titolo: 1, autore: 1, _id: 0 })

// Mostra tutti i campi tranne "pagine"
db.libri.find({}, { pagine: 0 })
```

**Regole:**
- `1` = includi il campo
- `0` = escludi il campo
- Non puoi mescolare inclusioni ed esclusioni (tranne per `_id`)

**Esempi:**

```javascript
// ✅ Valido
db.libri.find({}, { titolo: 1, autore: 1 })

// ✅ Valido
db.libri.find({}, { pagine: 0, genere: 0 })

// ❌ Non valido (mix di inclusioni ed esclusioni)
db.libri.find({}, { titolo: 1, pagine: 0 })
```

---

## 10. Eliminare documenti e collezioni

### 10.1 Eliminare documenti

```javascript
// Elimina un documento
db.libri.deleteOne({ titolo: "1984" })

// Elimina più documenti
db.libri.deleteMany({ anno: { $lt: 1900 } })

// Elimina tutti i documenti
db.libri.deleteMany({})
```

### 10.2 Eliminare una collezione

```javascript
db.libri.drop()
```

Output:

```
true
```

### 10.3 Eliminare un database

```javascript
// Assicurati di essere nel database giusto
use biblioteca

// Elimina il database corrente
db.dropDatabase()
```

Output:

```json
{ "ok": 1, "dropped": "biblioteca" }
```

---

## 11. Comandi utili di `mongosh`

### 11.1 Informazioni sul server

```javascript
// Versione di MongoDB
db.version()

// Statistiche del database
db.stats()

// Stato del server
db.serverStatus()
```

### 11.2 Informazioni sulla collezione

```javascript
// Statistiche della collezione
db.libri.stats()

// Nomi dei campi (sample)
db.libri.findOne()
```

### 11.3 Aiuto

```javascript
// Aiuto generale
help

// Aiuto sui comandi del database
db.help()

// Aiuto sui metodi di una collezione
db.libri.help()
```

---

## 12. Operatori di query comuni

### 12.1 Operatori di confronto

```javascript
// Maggiore di ($gt)
db.libri.find({ anno: { $gt: 1950 } })

// Maggiore o uguale ($gte)
db.libri.find({ pagine: { $gte: 300 } })

// Minore di ($lt)
db.libri.find({ anno: { $lt: 1900 } })

// Minore o uguale ($lte)
db.libri.find({ pagine: { $lte: 200 } })

// Diverso da ($ne)
db.libri.find({ genere: { $ne: "Fantasy" } })

// In un set di valori ($in)
db.libri.find({ genere: { $in: ["Fantasy", "Distopia"] } })

// Non in un set di valori ($nin)
db.libri.find({ anno: { $nin: [1949, 1954] } })
```

### 12.2 Operatori logici

```javascript
// AND (implicito)
db.libri.find({ genere: "Fantasy", anno: { $gt: 1950 } })

// OR
db.libri.find({
  $or: [
    { genere: "Fantasy" },
    { anno: { $gt: 2000 } }
  ]
})

// NOT
db.libri.find({ anno: { $not: { $lt: 1900 } } })
```

---

## 13. Esercizio pratico guidato

### Scenario: Biblioteca scolastica

Crea un database per gestire una biblioteca scolastica.

**Passo 1: Crea il database**

```javascript
use biblioteca_scuola
```

**Passo 2: Inserisci alcuni libri**

```javascript
db.libri.insertMany([
  {
    isbn: "978-8804668565",
    titolo: "Il piccolo principe",
    autore: "Antoine de Saint-Exupéry",
    anno: 1943,
    genere: "Favola",
    copie_disponibili: 5,
    scaffale: "A3"
  },
  {
    isbn: "978-8807901836",
    titolo: "Pinocchio",
    autore: "Carlo Collodi",
    anno: 1883,
    genere: "Fiaba",
    copie_disponibili: 3,
    scaffale: "A1"
  },
  {
    isbn: "978-8817070645",
    titolo: "Promessi Sposi",
    autore: "Alessandro Manzoni",
    anno: 1827,
    genere: "Romanzo storico",
    copie_disponibili: 10,
    scaffale: "B5"
  }
])
```

**Passo 3: Query di esempio**

```javascript
// Trova tutti i libri con almeno 5 copie disponibili
db.libri.find({ copie_disponibili: { $gte: 5 } })

// Trova libri di genere "Fiaba" o "Favola"
db.libri.find({ genere: { $in: ["Fiaba", "Favola"] } })

// Mostra solo titolo e autore
db.libri.find({}, { titolo: 1, autore: 1, _id: 0 })

// Conta i libri pubblicati prima del 1900
db.libri.countDocuments({ anno: { $lt: 1900 } })

// Ordina per anno di pubblicazione
db.libri.find().sort({ anno: 1 })
```

---

## 14. Best practices

✅ **Nomina le collezioni al plurale**: `libri`, `utenti`, `ordini`  
✅ **Usa nomi descrittivi per i campi**: `data_pubblicazione` invece di `data`  
✅ **Usa snake_case o camelCase in modo consistente**  
✅ **Inserisci campioni di dati per testare le query**  
✅ **Usa `countDocuments()` per verificare il numero di risultati prima di un `find()`**  
✅ **Esplora i dati con `findOne()` per capire la struttura**

---

## Riepilogo

In questo capitolo hai imparato:

✅ Come connetterti a MongoDB con `mongosh`  
✅ Navigare tra database e collezioni  
✅ Creare database e collezioni automaticamente  
✅ Inserire documenti con `insertOne()` e `insertMany()`  
✅ Leggere documenti con `find()` e `findOne()`  
✅ Filtrare, ordinare e limitare i risultati  
✅ Usare proiezioni per selezionare campi specifici  
✅ Eliminare documenti, collezioni e database  
✅ Operatori di query base (`$gt`, `$in`, `$or`, ecc.)

Nel prossimo modulo, esplorerai in dettaglio tutte le operazioni CRUD (Create, Read, Update, Delete) con esempi pratici e approfondimenti.

---

## Esercizi

Vai alla cartella [esercizi/](./esercizi/) per mettere in pratica i concetti appresi!
