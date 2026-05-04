# Capitolo 1 — Introduzione a MongoDB

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Comprendere le differenze tra database relazionali e NoSQL
- Conoscere i vantaggi e gli svantaggi di MongoDB
- Capire il modello a documenti: collezioni, documenti e campi
- Installare MongoDB e MongoDB Shell (`mongosh`)
- Utilizzare MongoDB Compass per gestire i database graficamente

---

## 1. Cosa sono i database NoSQL

I database **NoSQL** (Not Only SQL) sono sistemi di gestione dei dati che non utilizzano il modello relazionale tradizionale basato su tabelle, righe e colonne. Sono stati progettati per gestire grandi volumi di dati non strutturati o semi-strutturati, offrendo maggiore flessibilità e scalabilità rispetto ai database relazionali.

### Tipi di database NoSQL

Esistono diverse categorie di database NoSQL:

1. **Document-oriented** (orientati ai documenti): MongoDB, CouchDB
   - I dati sono memorizzati come documenti JSON o simili
   - Ogni documento può avere una struttura diversa

2. **Key-Value stores** (chiave-valore): Redis, DynamoDB
   - Memorizzano coppie chiave-valore
   - Accesso rapido tramite chiave

3. **Column-family stores** (famiglie di colonne): Cassandra, HBase
   - I dati sono organizzati per colonne anziché per righe
   - Ottimizzati per query analitiche

4. **Graph databases** (database a grafo): Neo4j, ArangoDB
   - Rappresentano relazioni complesse tra entità
   - Ottimi per social network, raccomandazioni

---

## 2. Database relazionali vs NoSQL

### Database relazionali (SQL)

**Caratteristiche:**
- Schema fisso e predefinito
- Dati organizzati in tabelle con righe e colonne
- Relazioni tra tabelle tramite chiavi esterne (foreign keys)
- Linguaggio di interrogazione: SQL (Structured Query Language)
- Transazioni ACID (Atomicity, Consistency, Isolation, Durability)

**Vantaggi:**
- Struttura rigida garantisce integrità dei dati
- Ottimi per dati strutturati e relazioni complesse
- Standard consolidato (SQL)
- Transazioni affidabili

**Svantaggi:**
- Schema rigido: modifiche alla struttura richiedono migrazioni complesse
- Scalabilità verticale (più costosa)
- Prestazioni ridotte con dati non strutturati

**Esempi:** MySQL, PostgreSQL, Oracle, SQL Server

### Database NoSQL (MongoDB)

**Caratteristiche:**
- Schema flessibile (schema-less o schema dinamico)
- Dati organizzati in documenti JSON/BSON
- Nessuna necessità di JOIN complessi
- Query con sintassi simile a JavaScript
- Scalabilità orizzontale (aggiungere server)

**Vantaggi:**
- Flessibilità: ogni documento può avere campi diversi
- Sviluppo rapido: nessuna migrazione per modifiche allo schema
- Scalabilità orizzontale: facile distribuire su più server
- Ottimo per applicazioni web moderne (API REST, microservizi)
- Documenti JSON si integrano naturalmente con JavaScript

**Svantaggi:**
- Meno garanzie di integrità referenziale
- Query complesse possono essere meno efficienti
- Denormalizzazione può causare ridondanza

**Quando usare MongoDB:**
- Applicazioni web con dati semi-strutturati
- Prototipazione rapida (schema flessibile)
- Big data e analisi in tempo reale
- Applicazioni che richiedono scalabilità orizzontale
- Content management systems (CMS)
- Cataloghi di prodotti con attributi variabili

---

## 3. Il modello a documenti di MongoDB

MongoDB è un database **document-oriented**: i dati sono memorizzati in documenti JSON (tecnicamente BSON, una versione binaria di JSON).

### 3.1 Documenti

Un **documento** è l'unità di base di MongoDB, equivalente a una riga in un database relazionale.

**Esempio di documento:**

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "nome": "Mario",
  "cognome": "Rossi",
  "eta": 28,
  "email": "mario.rossi@example.com",
  "interessi": ["calcio", "musica", "viaggi"],
  "indirizzo": {
    "via": "Via Roma 10",
    "citta": "Milano",
    "cap": "20100"
  }
}
```

**Caratteristiche dei documenti:**

- **Formato JSON/BSON**: chiavi e valori, come oggetti JavaScript
- **Schema flessibile**: ogni documento può avere campi diversi
- **Nessun limite rigido**: possono contenere array e documenti annidati
- **Campo `_id`**: identificatore univoco generato automaticamente

### 3.2 Collezioni

Una **collezione** è un gruppo di documenti, equivalente a una tabella in SQL.

**Caratteristiche:**
- Non impone uno schema rigido
- I documenti all'interno possono avere strutture diverse
- Non richiedono definizione preventiva (vengono create automaticamente)

**Esempio:**

La collezione `utenti` potrebbe contenere:

```json
// Documento 1
{ "_id": 1, "nome": "Mario", "cognome": "Rossi", "eta": 28 }

// Documento 2 - struttura diversa!
{ "_id": 2, "nome": "Laura", "cognome": "Bianchi", "professione": "Ingegnere", "stipendio": 45000 }
```

### 3.3 Database

Un **database** è un contenitore di collezioni.

**Esempio di struttura:**

```
Database: ecommerce
  ├── Collezione: utenti
  ├── Collezione: prodotti
  ├── Collezione: ordini
  └── Collezione: recensioni
```

### 3.4 Confronto con SQL

| Concetto SQL | Concetto MongoDB |
|--------------|------------------|
| Database | Database |
| Tabella | Collezione |
| Riga | Documento |
| Colonna | Campo |
| Indice | Indice |
| JOIN | Embedding o riferimenti |
| Chiave primaria | `_id` (generato automaticamente) |

---

## 4. BSON: Binary JSON

MongoDB memorizza i documenti in formato **BSON** (Binary JSON), un'estensione binaria di JSON.

**Vantaggi di BSON:**
- Supporta tipi di dati aggiuntivi: `Date`, `ObjectId`, `Binary`, `Decimal128`
- Più efficiente da attraversare (parsing più veloce)
- Supporta numeri a 64 bit, mentre JSON standard lavora con float

**Tipi di dati comuni in BSON:**

| Tipo | Descrizione | Esempio |
|------|-------------|---------|
| `String` | Stringa UTF-8 | `"Ciao mondo"` |
| `Number` | Numero intero o decimale | `42`, `3.14` |
| `Boolean` | Valore booleano | `true`, `false` |
| `Array` | Lista di valori | `[1, 2, 3]` |
| `Object` | Documento annidato | `{ "nome": "Mario" }` |
| `Date` | Data e ora | `ISODate("2026-05-04")` |
| `ObjectId` | Identificatore univoco | `ObjectId("507f1f77bcf86cd799439011")` |
| `Null` | Valore nullo | `null` |

---

## 5. Il campo `_id` e ObjectId

Ogni documento in MongoDB ha un campo **`_id`** che funge da chiave primaria.

### 5.1 ObjectId

Se non specifichi un valore per `_id`, MongoDB genera automaticamente un **ObjectId**.

**Struttura di un ObjectId (12 byte):**

```
ObjectId("507f1f77bcf86cd799439011")
         └─────┬─────┴─┬─┴──┬──┴──┬─┘
               │       │    │     └─ 3 byte: contatore random
               │       │    └─ 2 byte: identificatore del processo
               │       └─ 5 byte: valore random
               └─ 4 byte: timestamp (secondi dal 1970)
```

**Proprietà:**
- Univoco a livello globale (anche su server diversi)
- Include timestamp di creazione: `ObjectId("...").getTimestamp()`
- Ordinabile cronologicamente

**Esempio:**

```javascript
// Creare un ObjectId
const id = ObjectId();

// Estrarre il timestamp
id.getTimestamp(); // Restituisce la data di creazione
```

### 5.2 Chiavi personalizzate

Puoi specificare un valore personalizzato per `_id`:

```json
{
  "_id": "utente_001",
  "nome": "Mario",
  "cognome": "Rossi"
}
```

---

## 6. Installazione di MongoDB

### 6.1 Installazione su Windows

1. **Scarica MongoDB Community Server**  
   Vai su [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) e scarica l'installer MSI per Windows.

2. **Esegui l'installer**  
   - Scegli "Complete" per l'installazione completa
   - Installa MongoDB come servizio (opzione consigliata)
   - Installa anche MongoDB Compass (GUI)

3. **Verifica l'installazione**  
   Apri il terminale (CMD o PowerShell) e digita:
   ```bash
   mongod --version
   ```

### 6.2 Installazione su macOS

**Con Homebrew:**

```bash
# Installa Homebrew (se non presente)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Aggiungi il tap di MongoDB
brew tap mongodb/brew

# Installa MongoDB Community Edition
brew install mongodb-community

# Avvia MongoDB come servizio
brew services start mongodb-community
```

**Verifica:**

```bash
mongod --version
```

### 6.3 Installazione su Linux (Ubuntu/Debian)

```bash
# Importa la chiave pubblica
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Aggiungi il repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Aggiorna i pacchetti
sudo apt update

# Installa MongoDB
sudo apt install -y mongodb-org

# Avvia MongoDB
sudo systemctl start mongod

# Abilita l'avvio automatico
sudo systemctl enable mongod
```

**Verifica:**

```bash
mongod --version
```

---

## 7. MongoDB Shell (`mongosh`)

**MongoDB Shell** (`mongosh`) è l'interfaccia a riga di comando interattiva per MongoDB.

### 7.1 Installazione di `mongosh`

`mongosh` è incluso in MongoDB Community Edition. Se non è installato:

**Windows:** Scarica da [https://www.mongodb.com/try/download/shell](https://www.mongodb.com/try/download/shell)

**macOS:**
```bash
brew install mongosh
```

**Linux:**
```bash
wget https://downloads.mongodb.com/compass/mongosh-2.0.0-linux-x64.tgz
tar -zxvf mongosh-2.0.0-linux-x64.tgz
sudo cp mongosh-2.0.0-linux-x64/bin/mongosh /usr/local/bin/
```

### 7.2 Connettersi a MongoDB

Avvia `mongosh` digitando:

```bash
mongosh
```

Output tipico:

```
Current Mongosh Log ID: 64a1b2c3d4e5f6a7b8c9d0e1
Connecting to: mongodb://127.0.0.1:27017/
Using MongoDB: 7.0.0
Using Mongosh: 2.0.0

test>
```

**Connessione con URI personalizzato:**

```bash
mongosh "mongodb://localhost:27017/mioDatabase"
```

### 7.3 Comandi utili in `mongosh`

```javascript
// Mostra tutti i database
show dbs

// Seleziona un database
use nomeDatabase

// Mostra il database corrente
db

// Mostra le collezioni nel database corrente
show collections

// Mostra versione di MongoDB
db.version()

// Statistiche del database
db.stats()

// Aiuto
help

// Esci da mongosh
exit
```

---

## 8. MongoDB Compass

**MongoDB Compass** è il client grafico ufficiale per MongoDB. Permette di esplorare, interrogare e gestire i database senza usare la shell.

### 8.1 Installazione

Compass è incluso nell'installer di MongoDB Community Edition. Altrimenti, scarica da:  
[https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)

### 8.2 Funzionalità principali

- **Esplorazione visuale**: naviga tra database e collezioni
- **Query builder**: crea query con un'interfaccia grafica
- **Visualizzazione dati**: vedi i documenti in formato JSON, tabella o albero
- **Schema analyzer**: analizza la struttura dei documenti
- **Performance insights**: monitora le prestazioni delle query
- **Aggregation pipeline builder**: costruisci pipeline graficamente
- **Indici**: crea e gestisci gli indici

### 8.3 Connessione con Compass

1. Avvia MongoDB Compass
2. Nella schermata di connessione, inserisci l'URI:
   ```
   mongodb://localhost:27017
   ```
3. Clicca su **Connect**

### 8.4 Quando usare Compass vs `mongosh`

**Usa Compass quando:**
- Vuoi esplorare visualmente i dati
- Stai imparando MongoDB
- Devi analizzare la struttura dei documenti
- Preferisci un'interfaccia grafica

**Usa `mongosh` quando:**
- Devi automatizzare operazioni (script)
- Lavori su server remoti via SSH
- Preferisci la riga di comando
- Devi eseguire operazioni batch

---

## 9. Architettura di MongoDB

### 9.1 Componenti principali

**`mongod`**: il processo server di MongoDB (daemon)
- Gestisce le richieste dei client
- Memorizza i dati su disco
- Esegue le operazioni di lettura/scrittura

**`mongosh`**: la shell interattiva
- Interfaccia per interagire con `mongod`
- Permette di eseguire comandi JavaScript

**MongoDB Compass**: client grafico

### 9.2 Dove vengono salvati i dati?

I dati di MongoDB sono memorizzati nella cartella **data directory** (dbPath):

- **Windows**: `C:\Program Files\MongoDB\Server\7.0\data\`
- **macOS**: `/usr/local/var/mongodb/`
- **Linux**: `/var/lib/mongodb/`

Puoi specificare una cartella personalizzata:

```bash
mongod --dbpath /percorso/personalizzato
```

### 9.3 Porta predefinita

MongoDB ascolta sulla porta **27017** di default.

---

## 10. Primi passi: creare un database di prova

Ora proviamo a creare il nostro primo database!

### Passo 1: Avvia `mongosh`

```bash
mongosh
```

### Passo 2: Crea e seleziona un database

```javascript
use biblioteca
```

> **Nota:** Il database `biblioteca` non esiste ancora fisicamente. Verrà creato automaticamente quando inserirai il primo documento.

### Passo 3: Inserisci un documento

```javascript
db.libri.insertOne({
  titolo: "Il Signore degli Anelli",
  autore: "J.R.R. Tolkien",
  anno: 1954,
  genere: "Fantasy"
})
```

Output:

```json
{
  "acknowledged": true,
  "insertedId": ObjectId("64a1b2c3d4e5f6a7b8c9d0e1")
}
```

### Passo 4: Verifica il database creato

```javascript
show dbs
```

Dovresti vedere `biblioteca` nell'elenco!

### Passo 5: Visualizza i documenti

```javascript
db.libri.find()
```

Output:

```json
{
  "_id": ObjectId("64a1b2c3d4e5f6a7b8c9d0e1"),
  "titolo": "Il Signore degli Anelli",
  "autore": "J.R.R. Tolkien",
  "anno": 1954,
  "genere": "Fantasy"
}
```

---

## 11. Risorse utili

- **Documentazione ufficiale MongoDB**: [https://www.mongodb.com/docs/](https://www.mongodb.com/docs/)
- **MongoDB University** (corsi gratuiti): [https://learn.mongodb.com/](https://learn.mongodb.com/)
- **MongoDB Cheat Sheet**: [https://www.mongodb.com/developer/products/mongodb/cheat-sheet/](https://www.mongodb.com/developer/products/mongodb/cheat-sheet/)
- **MongoDB Community Forums**: [https://www.mongodb.com/community/forums/](https://www.mongodb.com/community/forums/)

---

## Riepilogo

In questo capitolo hai imparato:

✅ Le differenze tra database relazionali e NoSQL  
✅ I vantaggi del modello a documenti di MongoDB  
✅ La struttura di documenti, collezioni e database  
✅ Il formato BSON e il campo `_id`  
✅ Come installare MongoDB e MongoDB Shell (`mongosh`)  
✅ Come usare MongoDB Compass per gestire i database  
✅ Come creare il tuo primo database e collezione

Nel prossimo capitolo, imparerai a eseguire MongoDB in un container Docker per facilitare lo sviluppo e il deployment delle applicazioni.

---

## Esercizi

Vai alla cartella [esercizi/](./esercizi/) per mettere in pratica i concetti appresi!
