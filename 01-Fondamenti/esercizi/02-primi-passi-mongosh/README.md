# 🎓 Laboratorio 02: Primi Passi con MongoDB Shell

## Obiettivi Didattici

Al termine di questa esercitazione lo studente sarà in grado di:

1. **Avviare e gestire** un'istanza MongoDB con Docker Compose
2. **Connettersi** a MongoDB usando `mongosh` (MongoDB Shell)
3. **Creare database e collezioni** comprendendo il modello schemaless
4. **Inserire documenti** con `insertOne()` e `insertMany()`
5. **Interrogare dati** con `find()`, `findOne()` e filtri base
6. **Comprendere la struttura** dei documenti BSON e ObjectId
7. **Usare Mongo Express** per visualizzare graficamente i dati
8. **Esportare e importare dati** usando `mongoexport` e `mongoimport`

---

## 📋 Modalità di Consegna

**Creare un documento Google** con:

1. **Copertina**: Nome, Cognome, Classe, Data, Titolo ("Laboratorio 02 - MongoDB Shell")
2. **Indice**: Numerato con le sezioni dell'esercitazione
3. **Screenshot**: Per ogni sezione indicata con 📸 (minimo 20)
4. **Risposte alle domande di riflessione**: Indicate con ❓ (circa 40 domande)
5. **Comandi eseguiti**: Copia-incolla dei comandi mongosh con output
6. **Conclusioni personali**: Riflessione finale (minimo 150 parole)

**Formato screenshot**: 
- Risoluzione leggibile (almeno 1280px larghezza)
- Evidenziare comandi e output con bordi/frecce
- Didascalie che spiegano cosa mostra lo screenshot

**Consegna**: Link al documento Google condiviso con permessi di visualizzazione

---

## 📦 Contenuto dell'Esercitazione

### Cosa troverai in questa cartella

```
02-primi-passi-mongosh/
├── docker-compose.yml       ← Orchestrazione 2 servizi (MongoDB + Mongo Express)
├── .env.example             ← Template configurazione credenziali
├── .gitignore               ← Pattern per Git
├── volumes/
│   ├── mongo-data/          ← Dati MongoDB (persistenti)
│   └── mongo-scripts/
│       └── init.js          ← Script inizializzazione minimo
└── README.md                ← Questa guida
```

### Architettura Semplificata

```
┌────────────────────────────────────────────────┐
│           mongo_network (bridge)               │
│                                                │
│  ┌──────────────────┐    ┌──────────────────┐  │
│  │    mongodb       │    │  mongo-express   │  │
│  │    MongoDB 7.0   │◄───┤  GUI Web         │  │
│  │    porta 27017   │    │  porta 8081      │  │
│  └──────────────────┘    └──────────────────┘  │
│          ▲                                     │
│          │                                     │
│    mongosh (CLI)                               │
│    via docker exec                             │
└────────────────────────────────────────────────┘
```

**Differenze con l'esercitazione 01:**
- ❌ Nessun backend Node.js
- ❌ Nessun frontend HTML
- ❌ Nessuna REST API
- ✅ Solo MongoDB + Mongo Express
- ✅ Focus su comandi `mongosh`
- ✅ Interazione diretta con database

---

## 🏗️ Parte 1: Comprendere l'Architettura Minimale

### Perché un Setup Semplificato?

Questa esercitazione si concentra sui **fondamenti** di MongoDB senza la complessità di backend e frontend. L'obiettivo è:

1. **Imparare la sintassi mongosh** senza distrazioni
2. **Comprendere il modello dei dati** NoSQL
3. **Sperimentare liberamente** con creazione/modifica/eliminazione
4. **Familiarizzare con Mongo Express** come strumento di visualizzazione

### Componenti dell'Architettura

#### 1. **MongoDB Container**
- Immagine ufficiale `mongo:7.0`
- Porta esposta: `27017` (standard MongoDB)
- Autenticazione abilitata (username/password)
- Volume persistente per i dati
- Health check per verificare disponibilità

#### 2. **Mongo Express Container**
- Interfaccia web di amministrazione
- Porta esposta: `8081`
- Si connette a MongoDB via rete interna
- Autenticazione con username/password

#### 3. **Docker Network**
- Rete bridge `mongo_network`
- Permette comunicazione tra i 2 container
- Isolamento dalla rete host

### 🧠 Concetti Chiave

**Schema-less (Flessibile):**
- Non serve definire strutture prima dell'inserimento
- Ogni documento può avere campi diversi
- Facile aggiungere/rimuovere campi

**Collezioni:**
- Equivalenti alle "tabelle" SQL, ma senza schema rigido
- Create automaticamente al primo inserimento
- Possono contenere documenti di strutture diverse

**Documenti:**
- Unità base di dati (equivalente a "riga" SQL)
- Formato BSON (Binary JSON)
- Ogni documento ha `_id` univoco auto-generato

**ObjectId:**
- Identificatore univoco di 12 byte
- Contiene timestamp creazione
- Garantisce unicità anche in sistemi distribuiti

### ❓ Domande di Riflessione 1

Prima di procedere, rispondi nel tuo documento:

**R1.1** Spiega la differenza principale tra "schema-less" (MongoDB) e "schema-based" (SQL). Qual è il vantaggio principale di ciascun approccio?

**R1.2** In SQL hai tabelle con colonne predefinite. In MongoDB hai collezioni con documenti. Cosa succederebbe se in MongoDB inserisci 2 documenti nella stessa collezione con campi completamente diversi? È permesso? Perché?

**R1.3** Perché MongoDB usa ObjectId invece di semplici numeri auto-incrementali come SQL (es: 1, 2, 3...)? Cerca informazioni su "distributed systems" e "sharding" per approfondire.

**R1.4** Il volume `./volumes/mongo-data` mappa la cartella `/data/db` del container. Disegna uno schema che mostra cosa succederebbe ai dati se:
   - Fermi il container con `docker compose stop`
   - Rimuovi il container con `docker compose down`
   - Cancelli la cartella `volumes/mongo-data`

---

## 🚀 Parte 2: Setup e Avvio dell'Ambiente

### Step 2.1: Preparazione File

```bash
# 1. Entra nella cartella dell'esercitazione
cd 02-primi-passi-mongosh

# 2. Crea il file .env personalizzato
cp .env.example .env

# 3. (Opzionale) Personalizza le credenziali
nano .env
```

**Contenuto .env:**
```ini
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGOEXPRESS_USERNAME=admin
MONGOEXPRESS_PASSWORD=admin123
```

**📸 SCREENSHOT 1**: Contenuto del file `.env` (puoi offuscare le password).

**🔐 Nota sulla Sicurezza:**
- Queste sono credenziali di **sviluppo locale**
- In produzione usa password forti (min 16 caratteri, mix caratteri)
- Mai committare `.env` su Git (è già in `.gitignore`)
- In produzione usa gestori di segreti (AWS Secrets Manager, HashiCorp Vault)

### Step 2.2: Analisi del docker-compose.yml

```bash
cat docker-compose.yml
```

**Analizza le sezioni principali:**

```yaml
services:
  mongodb:
    image: mongo:7.0              # Versione stabile MongoDB
    container_name: mongodb_primi_passi
    ports:
      - "27017:27017"             # Espone MongoDB sulla porta standard
    environment:                   # Credenziali da .env
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - ./volumes/mongo-data:/data/db              # Persistenza dati
      - ./volumes/mongo-scripts:/docker-entrypoint-initdb.d  # Script init
    healthcheck:                   # Verifica che MongoDB sia pronto
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      retries: 5
```

**📸 SCREENSHOT 2**: File `docker-compose.yml` completo visualizzato.

**❓ Domande di Riflessione 2**

**R2.1** Il servizio `mongodb` ha `restart: always`. Cosa significa? Quando il container si riavvierebbe automaticamente? Fai 2 esempi pratici (es: dopo crash, dopo riavvio sistema operativo).

**R2.2** Il healthcheck esegue `db.adminCommand('ping')` ogni 10 secondi per 5 volte max (50 secondi totali). Perché è importante avere un healthcheck? Cosa succederebbe senza?

**R2.3** La cartella `./volumes/mongo-scripts` è mappata su `/docker-entrypoint-initdb.d`. Cerca nella documentazione Docker MongoDB cosa fa questa cartella speciale. Quando vengono eseguiti gli script al suo interno?

### Step 2.3: Avvio dei Container

```bash
# Avvia in background (-d = detached)
docker compose up -d
```

**Prima esecuzione:** Docker scaricherà le immagini (~700 MB totali).

**Output atteso:**
```
[+] Running 3/3
 ✔ Network mongo_network        Created
 ✔ Container mongodb_primi_passi  Started
 ✔ Container mongo_express_ui     Started
```

**Tempo stimato:** 1-2 minuti primo avvio, 10-15 secondi avvii successivi.

**📸 SCREENSHOT 3**: Output completo di `docker compose up -d`.

### Step 2.4: Verifica Stato Container

```bash
# Mostra container attivi
docker compose ps
```

**Output atteso:**
```
NAME                    IMAGE              STATUS
mongodb_primi_passi     mongo:7.0          Up (healthy)
mongo_express_ui        mongo-express      Up
```

**Note:**
- `mongodb_primi_passi` deve mostrare **(healthy)** dopo ~20-30 secondi
- Se vedi `(health: starting)`, attendi qualche secondo e ricontrolla

**📸 SCREENSHOT 4**: Output di `docker compose ps` con container healthy.

**Comandi troubleshooting:**

```bash
# Visualizza log in tempo reale
docker compose logs -f

# Log solo di MongoDB
docker compose logs mongodb

# Controlla uso risorse
docker stats --no-stream
```

**❓ Domande di Riflessione 3**

**R3.1** Esegui `docker compose logs mongodb | grep -i "waiting"`. Vedi messaggi tipo "Waiting for connections"? Cosa significa? In che punto dell'avvio MongoDB è pronto ad accettare connessioni?

**R3.2** Apri il file `volumes/mongo-scripts/init.js`. Cosa stampa questo script? Viene eseguito a ogni avvio o solo al primo? (Suggerimento: prova a fermareRE e riavviare i container e controlla i log)

**R3.3** Esegui `docker network ls` e trova la rete `mongo_network`. Poi esegui `docker network inspect mongo_network`. Quali container sono connessi? Quale range di IP usa?

---

## 💻 Parte 3: Primi Comandi in MongoDB Shell

### Step 3.1: Accesso alla Shell

**Metodo 1 - Con autenticazione in linea:**
```bash
docker exec -it mongodb_primi_passi mongosh -u admin -p password123
```

**Metodo 2 - Accesso e poi autenticazione:**
```bash
# 1. Entra nel container
docker exec -it mongodb_primi_passi mongosh

# 2. Autentica (dentro mongosh)
use admin
db.auth('admin', 'password123')
```

**Output atteso:**
```
Current Mongosh Log ID: 6641f2a3b4c5d6e7f8a9b0c1
Connecting to: mongodb://127.0.0.1:27017/?directConnection=true
Using MongoDB: 7.0.0
Using Mongosh: 2.1.0

test>
```

**📸 SCREENSHOT 5**: Terminale con mongosh connesso e autenticato.

**Comandi base di navigazione:**

```javascript
// Mostra tutti i database
show dbs

// Controlla database corrente
db

// Mostra versione MongoDB
db.version()

// Mostra comandi disponibili
help
```

**📸 SCREENSHOT 6**: Output di `show dbs` che mostra i database di sistema (admin, config, local).

**❓ Domande di Riflessione 4**

**R4.1** Nell'output di `show dbs`, vedi 3 database: admin, config, local. Cerca e spiega cosa contiene ciascuno. Perché esistono anche quando non hai creato nulla?

**R4.2** Il prompt mostra `test>`. Cosa significa? Sei connesso al database "test"? Se esegui `use admin` il prompt cambia?

**R4.3** Prova a eseguire `db.getName()` e `db`. Sono equivalenti? Quale differenza c'è tra un metodo (con parentesi) e una proprietà?

### Step 3.2: Creare un Database

MongoDB crea database **lazy** (pigro): il database esiste solo quando inserisci dati.

```javascript
// "Seleziona" database (anche se non esiste ancora)
use negozio
```

Output:
```
switched to db negozio
```

**Verifica:**
```javascript
db
// Output: negozio

show dbs
// Output: NON vedi "negozio" perché è vuoto!
```

**📸 SCREENSHOT 7**: Prompt che mostra `negozio>` ma `show dbs` non elenca "negozio".

**❓ Domande di Riflessione 5**

**R5.1** Hai fatto `use negozio` ma `show dbs` non lo mostra. Perché? Cosa devi fare affinché il database appaia?

**R5.2** In SQL faresti `CREATE DATABASE negozio;`. Qual è il vantaggio del sistema MongoDB? Quale svantaggio? (Pensa a errori di battitura: `use negozioo` invece di `negozio`)

### Step 3.3: Creare una Collezione (Implicito)

```javascript
// Inserisci un documento nella collezione "prodotti"
// La collezione verrà creata automaticamente!
db.prodotti.insertOne({
  nome: "Laptop Dell XPS 15",
  categoria: "Elettronica",
  prezzo: 1299.99,
  quantita: 15,
  disponibile: true
})
```

**Output:**
```json
{
  "acknowledged": true,
  "insertedId": ObjectId("6641f2a3b4c5d6e7f8a9b0c1")
}
```

**Ora verifica:**
```javascript
show dbs
// Output: negozio appare finalmente!

show collections
// Output: prodotti

db.prodotti.find()
// Output: visualizza il documento inserito
```

**📸 SCREENSHOT 8**: Comando `insertOne()` con output che mostra `insertedId`, seguito da `show dbs` che ora include "negozio".

**❓ Domande di Riflessione 6**

**R6.1** Analizza l'`insertedId` generato. È un ObjectId con 24 caratteri esadecimali. Cerca online un "ObjectId decoder" e incolla il tuo ID. Cosa mostrano i primi 8 caratteri (timestamp)? Corrisponde all'orario del tuo inserimento?

**R6.2** Hai inserito un documento senza specificare `_id`. MongoDB lo ha generato automaticamente. Cosa succederebbe se inserisci un documento specificando tu l'`_id`? Prova con:
```javascript
db.prodotti.insertOne({ _id: 1, nome: "Test", prezzo: 10 })
db.prodotti.insertOne({ _id: 1, nome: "Test2", prezzo: 20 })  // Stesso _id!
```
Documenta l'errore ricevuto.

**R6.3** Il documento ha campo `disponibile: true` (booleano). In JSON standard ci sono questi tipi: string, number, boolean, null, array, object. BSON (Binary JSON) supporta tipi aggiuntivi. Elencane almeno 3 con esempi (es: Date, Decimal128, ...).

---

## 📝 Parte 4: Inserimenti Multipli e Strutture Dati

### Step 4.1: Inserire Più Documenti con `insertMany()`

```javascript
// Usa sempre il database "negozio"
use negozio

// Inserisci array di documenti
db.prodotti.insertMany([
  {
    nome: "iPhone 15 Pro",
    categoria: "Elettronica",
    prezzo: 1199.99,
    quantita: 25,
    disponibile: true,
    specifiche: {
      memoria: "256GB",
      colore: "Titanio Naturale",
      peso: 187
    },
    tags: ["smartphone", "apple", "5G"]
  },
  {
    nome: "Scrivania IKEA Bekant",
    categoria: "Arredamento",
    prezzo: 249.00,
    quantita: 8,
    disponibile: true,
    dimensioni: {
      larghezza: 160,
      profondita: 80,
      altezza: 65
    },
    tags: ["ufficio", "regolabile"]
  },
  {
    nome: "Caffè Lavazza Qualità Oro",
    categoria: "Alimentari",
    prezzo: 12.50,
    quantita: 120,
    disponibile: true,
    peso_grammi: 1000,
    scadenza: new Date("2025-12-31"),
    tags: ["caffè", "arabica"]
  },
  {
    nome: "Scarpe Nike Air Max",
    categoria: "Abbigliamento",
    prezzo: 89.99,
    quantita: 0,
    disponibile: false,
    taglie: [38, 39, 40, 41, 42, 43, 44],
    colori: ["Nero", "Bianco", "Blu"]
  }
])
```

**Output:**
```json
{
  "acknowledged": true,
  "insertedIds": {
    "0": ObjectId("..."),
    "1": ObjectId("..."),
    "2": ObjectId("..."),
    "3": ObjectId("...")
  }
}
```

**📸 SCREENSHOT 9**: Comando `insertMany()` completo e output con i 4 `insertedIds`.

### Step 4.2: Verifica e Analisi dei Documenti

```javascript
// Conta documenti
db.prodotti.countDocuments()
// Output: 5 (1 iniziale + 4 nuovi)

// Visualizza tutti (formattato)
db.prodotti.find().pretty()

// Visualizza solo il primo
db.prodotti.findOne()
```

**📸 SCREENSHOT 10**: Output di `db.prodotti.find()` mostrando almeno 3 documenti completi con strutture diverse.

**❓ Domande di Riflessione 7**

**R7.1** Osserva i 5 documenti inseriti. Hanno tutti gli stessi campi? Quale ha un campo `specifiche` oggetto annidato? Quale ha array `taglie` e `colori`? Questo sarebbe possibile in SQL senza tabelle relazionali aggiuntive?

**R7.2** Il documento del caffè ha campo `scadenza: new Date("2025-12-31")`. Che tipo di dato è? Come viene visualizzato in mongosh? Cerca la differenza tra `new Date()` JavaScript e `ISODate()` MongoDB.

**R7.3** Il campo `tags` è un array di stringhe. Come faresti in SQL a memorizzare più tag per un prodotto? Quale approccio è più semplice e perché?

**R7.4** Il prodotto "Scarpe Nike" ha `quantita: 0` e `disponibile: false`. È necessario avere entrambi i campi? Potresti calcolare `disponibile` basandoti solo su `quantita > 0`? Quando è utile avere campi "derivati" espliciti?

### Step 4.3: Strutture Dati Complesse

**Documenti annidati (nested documents):**

```javascript
db.clienti.insertOne({
  nome: "Mario",
  cognome: "Rossi",
  email: "mario.rossi@example.com",
  indirizzo: {
    via: "Via Roma 123",
    citta: "Milano",
    cap: "20100",
    provincia: "MI",
    coordinate: {
      lat: 45.4642,
      lon: 9.1900
    }
  },
  telefoni: [
    { tipo: "casa", numero: "02-12345678" },
    { tipo: "cellulare", numero: "+39 333 1234567" }
  ],
  data_registrazione: new Date(),
  preferenze: {
    newsletter: true,
    notifiche_push: false
  }
})
```

**📸 SCREENSHOT 11**: Documento cliente inserito con struttura annidata complessa.

**Verifica:**
```javascript
db.clienti.findOne()
```

**❓ Domande di Riflessione 8**

**R8.1** Il cliente ha indirizzo con coordinate geografiche annidate 3 livelli: `indirizzo → coordinate → lat/lon`. In SQL quante tabelle useresti per modellare questo? Disegna lo schema ER (Entity-Relationship) equivalente.

**R8.2** I telefoni sono un array di oggetti. Ogni oggetto ha `tipo` e `numero`. Questo si chiama "array of subdocuments". Quale vantaggio offre rispetto ad avere 2 array separati `tipi: ["casa", "cellulare"]` e `numeri: ["02-...", "+39..."]`?

**R8.3** Quando conviene usare documenti annidati (embedded) vs collezioni separate con riferimenti (references)? Cerca "MongoDB embedding vs referencing" e spiega con un esempio.

---

## 🔍 Parte 5: Interrogare i Dati - Query Base

### Step 5.1: Query di Uguaglianza

```javascript
// Prodotti di categoria "Elettronica"
db.prodotti.find({ categoria: "Elettronica" })

// Prodotti disponibili
db.prodotti.find({ disponibile: true })

// Prodotto specifico per nome
db.prodotti.findOne({ nome: "iPhone 15 Pro" })

// Combinazione (AND implicito)
db.prodotti.find({ 
  categoria: "Elettronica",
  disponibile: true
})
```

**📸 SCREENSHOT 12**: Query con filtro `categoria: "Elettronica"` e risultati.

### Step 5.2: Operatori di Comparazione

```javascript
// Prodotti con prezzo > 100
db.prodotti.find({ prezzo: { $gt: 100 } })

// Prodotti con prezzo <= 50
db.prodotti.find({ prezzo: { $lte: 50 } })

// Prodotti con quantità tra 10 e 30
db.prodotti.find({ 
  quantita: { $gte: 10, $lte: 30 }
})

// Prodotti con prezzo diverso da 12.50
db.prodotti.find({ prezzo: { $ne: 12.50 } })
```

**Operatori:**
- `$gt`: greater than (>)
- `$gte`: greater than or equal (≥)
- `$lt`: less than (<)
- `$lte`: less than or equal (≤)
- `$ne`: not equal (≠)
- `$eq`: equal (=) [equivalente a scrittura diretta]

**📸 SCREENSHOT 13**: Query con `$gt` e `$lte` mostrando i risultati filtrati.

**❓ Domande di Riflessione 9**

**R9.1** Esegui `db.prodotti.find({ prezzo: { $gt: 100, $lt: 1000 } })`. Quanti prodotti trova? Questo è un AND o un OR? Come faresti per trovare prodotti con prezzo < 100 OR prezzo > 1000?

**R9.2** Prova `db.prodotti.find({ quantita: { $exists: true } })`. Cosa fa l'operatore `$exists`? Quando è utile in un database schema-less dove non tutti i documenti hanno gli stessi campi?

### Step 5.3: Operatori Logici

```javascript
// OR: Elettronica O Alimentari
db.prodotti.find({
  $or: [
    { categoria: "Elettronica" },
    { categoria: "Alimentari" }
  ]
})

// AND: Disponibile E prezzo < 100
db.prodotti.find({
  $and: [
    { disponibile: true },
    { prezzo: { $lt: 100 } }
  ]
})

// NOT: Prodotti NON di categoria Elettronica
db.prodotti.find({
  categoria: { $not: { $eq: "Elettronica" } }
})
// Equivalente più semplice:
db.prodotti.find({ categoria: { $ne: "Elettronica" } })
```

**📸 SCREENSHOT 14**: Query con `$or` mostrando prodotti di 2 categorie.

### Step 5.4: Query su Array

```javascript
// Prodotti con tag "apple"
db.prodotti.find({ tags: "apple" })

// Prodotti con ALMENO UNO dei tag specificati
db.prodotti.find({ 
  tags: { $in: ["apple", "caffè", "ufficio"] }
})

// Prodotti che hanno TUTTI i tag specificati
db.prodotti.find({
  tags: { $all: ["smartphone", "5G"] }
})

// Prodotti con array tags di lunghezza 3
db.prodotti.find({
  tags: { $size: 3 }
})
```

**📸 SCREENSHOT 15**: Query su array `tags` con operatore `$in`.

**❓ Domande di Riflessione 10**

**R10.1** Differenza tra `tags: "apple"` (senza operatore) e `tags: { $in: ["apple"] }`. Sono equivalenti? Quale useresti per cercare un singolo valore in un array?

**R10.2** L'operatore `$size` trova array di lunghezza esatta. Non supporta range (es: lunghezza tra 2 e 5). Come risolveresti? Cerca "$expr" e operatore "$size" insieme.

**R10.3** Il prodotto "Scarpe Nike" ha array `taglie: [38, 39, 40, ...]`. Come troveresti tutti i prodotti che hanno taglia 42 disponibile? È uguale alla ricerca per tag stringa o diverso perché sono numeri?

### Step 5.5: Query su Documenti Annidati

```javascript
// Cliente con città Milano
db.clienti.find({ "indirizzo.citta": "Milano" })

// Cliente con latitudine > 45
db.clienti.find({ "indirizzo.coordinate.lat": { $gt: 45 } })

// Prodotto con memoria 256GB nelle specifiche
db.prodotti.find({ "specifiche.memoria": "256GB" })
```

**Nota:** Usa la **dot notation** (`campo.sottocampo`) tra virgolette.

**📸 SCREENSHOT 16**: Query con dot notation su documento annidato.

**❓ Domande di Riflessione 11**

**R11.1** Perché devi mettere le virgolette in `"indirizzo.citta"` e non puoi scrivere `indirizzo.citta` direttamente? (Suggerimento: pensa alla sintassi JavaScript/JSON)

**R11.2** Query su array di oggetti (subdocuments): Come troveresti il cliente con telefono tipo "cellulare"? Prova con `db.clienti.find({ "telefoni.tipo": "cellulare" })`. Funziona? Perché?

---

## ✏️ Parte 6: Proiezioni e Formattazione Output

### Step 6.1: Proiezioni (Selezione Campi)

```javascript
// Mostra solo nome e prezzo (esclude tutto il resto)
db.prodotti.find(
  {},  // filtro vuoto = tutti i documenti
  { nome: 1, prezzo: 1 }
)

// Esclude _id
db.prodotti.find(
  {},
  { nome: 1, prezzo: 1, _id: 0 }
)

// Esclude specifici campi (mostra tutti gli altri)
db.prodotti.find(
  {},
  { specifiche: 0, tags: 0 }
)

// Con filtro e proiezione insieme
db.prodotti.find(
  { categoria: "Elettronica" },
  { nome: 1, prezzo: 1, quantita: 1 }
)
```

**Regole:**
- `1` = include campo
- `0` = escludi campo
- Non puoi mescolare include/escludi (tranne `_id: 0`)
- `_id` è sempre incluso di default

**📸 SCREENSHOT 17**: Query con proiezione mostrando solo alcuni campi.

**❓ Domande di Riflessione 12**

**R12.1** Perché `_id` è sempre incluso di default? Quando useresti `_id: 0`? (Pensa a report, esportazioni, API pubbliche)

**R12.2** Prova query invalida: `db.prodotti.find({}, { nome: 1, prezzo: 0 })` (mix include/escludi). Che errore ottieni? Perché MongoDB non lo permette?

### Step 6.2: Ordinamento

```javascript
// Ordina per prezzo crescente
db.prodotti.find().sort({ prezzo: 1 })

// Ordina per prezzo decrescente
db.prodotti.find().sort({ prezzo: -1 })

// Ordina per categoria (A-Z) poi prezzo (alto-basso)
db.prodotti.find().sort({ categoria: 1, prezzo: -1 })

// Con filtro e ordinamento
db.prodotti.find(
  { disponibile: true }
).sort({ prezzo: 1 })
```

**Valori:**
- `1` = crescente (ASC)
- `-1` = decrescente (DESC)

**📸 SCREENSHOT 18**: Prodotti ordinati per prezzo decrescente.

### Step 6.3: Limitare Risultati

```javascript
// Primi 3 prodotti
db.prodotti.find().limit(3)

// Salta i primi 2, mostra i successivi 3
db.prodotti.find().skip(2).limit(3)

// Top 3 più costosi
db.prodotti.find().sort({ prezzo: -1 }).limit(3)

// Paginazione: pagina 2 con 2 risultati per pagina
const paginaCorrente = 2;
const risultatiPerPagina = 2;
db.prodotti.find()
  .skip((paginaCorrente - 1) * risultatiPerPagina)
  .limit(risultatiPerPagina)
```

**📸 SCREENSHOT 19**: Query con `limit(3)` e `sort()` per i 3 prodotti più costosi.

**❓ Domande di Riflessione 13**

**R13.1** L'ordine delle operazioni è importante? Prova `find().limit(3).sort({prezzo: -1})` vs `find().sort({prezzo: -1}).limit(3)`. Qual è il risultato corretto per "top 3"? MongoDB ottimizza automaticamente?

**R13.2** La paginazione con `skip()` ha problemi di performance con collezioni grandi. Perché? Cerca "cursor-based pagination" come alternativa e spiega brevemente.

**R13.3** Calcola: se hai 100 prodotti e vuoi pagina 5 con 10 risultati/pagina, quanti documenti `skip()`? Scrivi la formula generica.

### Step 6.4: Conteggi

```javascript
// Conta tutti i prodotti
db.prodotti.countDocuments()

// Conta prodotti disponibili
db.prodotti.countDocuments({ disponibile: true })

// Conta prodotti Elettronica con prezzo > 100
db.prodotti.countDocuments({
  categoria: "Elettronica",
  prezzo: { $gt: 100 }
})

// DEPRECATO (non usare):
// db.prodotti.count()  ← vecchia sintassi
```

**📸 SCREENSHOT 20**: Vari comandi `countDocuments()` con filtri diversi.

---

## 🗑️ Parte 7: Aggiornamenti e Eliminazioni

### Step 7.1: Aggiornare Documenti - `updateOne()`

```javascript
// Aumenta prezzo del Laptop di 100
db.prodotti.updateOne(
  { nome: "Laptop Dell XPS 15" },  // filtro
  { $set: { prezzo: 1399.99 } }    // aggiornamento
)

// Incrementa quantità di 5
db.prodotti.updateOne(
  { nome: "iPhone 15 Pro" },
  { $inc: { quantita: 5 } }
)

// Aggiungi un tag
db.prodotti.updateOne(
  { nome: "iPhone 15 Pro" },
  { $push: { tags: "premium" } }
)

// Aggiorna più campi contemporaneamente
db.prodotti.updateOne(
  { nome: "Scarpe Nike Air Max" },
  { 
    $set: { 
      quantita: 10, 
      disponibile: true,
      data_riassortimento: new Date()
    }
  }
)
```

**Output:**
```json
{
  "acknowledged": true,
  "matchedCount": 1,
  "modifiedCount": 1
}
```

**Operatori principali:**
- `$set`: imposta valore campo (crea se non esiste)
- `$inc`: incrementa/decrementa valore numerico
- `$push`: aggiungi elemento ad array
- `$pull`: rimuovi elemento da array
- `$unset`: rimuovi campo dal documento

**📸 SCREENSHOT 21**: `updateOne()` con `$set` e output che mostra `modifiedCount: 1`.

**❓ Domande di Riflessione 14**

**R14.1** L'output mostra `matchedCount` e `modifiedCount`. Possono essere diversi? Quando `matchedCount: 1` ma `modifiedCount: 0`? Fai un esempio pratico.

**R14.2** Usa `$inc` con valore negativo: `{ $inc: { quantita: -5 } }`. Cosa succede? È un modo per decrementare? Cosa succede se la quantità diventa negativa?

**R14.3** Differenza tra `$set: { tags: ["nuovo"] }` (sostituisce tutto l'array) e `$push: { tags: "nuovo" }` (aggiunge elemento). Quando useresti uno o l'altro?

### Step 7.2: Aggiornare Più Documenti - `updateMany()`

```javascript
// Sconto 10% su tutti i prodotti Elettronica
db.prodotti.updateMany(
  { categoria: "Elettronica" },
  { $mul: { prezzo: 0.9 } }  // moltiplica per 0.9 (= -10%)
)

// Aggiungi campo "verificato: true" a tutti
db.prodotti.updateMany(
  {},  // filtro vuoto = tutti i documenti
  { $set: { verificato: true } }
)

// Rimuovi campo "verificato" da tutti
db.prodotti.updateMany(
  {},
  { $unset: { verificato: "" } }  // valore stringa vuota
)
```

**Output:**
```json
{
  "acknowledged": true,
  "matchedCount": 5,
  "modifiedCount": 5
}
```

**�� SCREENSHOT 22**: `updateMany()` che modifica più documenti e output.

**Operatore `$mul`:**
```javascript
// Esempi di moltiplicazione
{ $mul: { prezzo: 1.1 } }   // +10%
{ $mul: { prezzo: 0.9 } }   // -10%
{ $mul: { prezzo: 2 } }     // raddoppia
{ $mul: { quantita: 0 } }   // azzera
```

### Step 7.3: Upsert (Update o Insert)

```javascript
// Se non trova il prodotto, lo crea
db.prodotti.updateOne(
  { nome: "Monitor Samsung 27" },  // filtro
  { 
    $set: { 
      categoria: "Elettronica",
      prezzo: 299.99,
      quantita: 12
    }
  },
  { upsert: true }  // opzione upsert
)
```

**Se documento non esiste:** viene creato con i campi del filtro + del `$set`.

**📸 SCREENSHOT 23**: Comando upsert e output che mostra `upsertedId`.

**❓ Domande di Riflessione 15**

**R15.1** Quando è utile l'upsert? Cerca scenario: sistema che riceve aggiornamenti prezzi da fornitore. Ogni giorno ricevi CSV con prodotti. Alcuni esistono già, altri no. Come gestiresti con upsert?

**R15.2** Attenzione all'upsert con operatori `$inc`, `$mul`, `$push`. Cosa succede se il documento non esiste e usi `{ $inc: { quantita: 5 } }`? Il campo viene creato con valore 5 o con 0+5?

### Step 7.4: Eliminazioni

```javascript
// Elimina UN documento
db.prodotti.deleteOne({ nome: "Caffè Lavazza Qualità Oro" })

// Elimina TUTTI i prodotti non disponibili
db.prodotti.deleteMany({ disponibile: false })

// Elimina tutti (PERICOLOSO!)
db.prodotti.deleteMany({})

// Verifica
db.prodotti.countDocuments()
```

**Output:**
```json
{
  "acknowledged": true,
  "deletedCount": 1
}
```

**📸 SCREENSHOT 24**: `deleteOne()` con output e verifica con `countDocuments()`.

**⚠️ Attenzione:**
- `deleteMany({})` elimina TUTTI i documenti della collezione
- Operazione irreversibile (senza conferma)
- Non elimina la collezione stessa (rimane vuota)

**❓ Domande di Riflessione 16**

**R16.1** Differenza tra `deleteMany({})` (elimina documenti) e `db.prodotti.drop()` (elimina collezione). Quando useresti uno o l'altro? Quale è più veloce per svuotare una collezione enorme?

**R16.2** Soft delete: invece di eliminare, potresti fare `updateMany({}, { $set: { eliminato: true, data_eliminazione: new Date() } })`. Vantaggi? Svantaggi? Come modificheresti le query di lettura?

---

## 🖥️ Parte 8: Mongo Express - Interfaccia Grafica

### Step 8.1: Accesso a Mongo Express

Apri browser: **http://localhost:8081**

**Login:**
- Username: `admin`
- Password: `admin123`

**📸 SCREENSHOT 25**: Schermata login Mongo Express.

### Step 8.2: Navigazione Database

**Home page:**
- Vedi elenco database (admin, config, local, negozio)
- Click su `negozio`

**📸 SCREENSHOT 26**: Vista database "negozio" con collezioni (prodotti, clienti).

### Step 8.3: Visualizzazione Documenti

**Dentro collezione `prodotti`:**
- Vedi tutti i documenti in formato JSON
- Ogni documento ha pulsanti: View, Edit, Delete, Duplicate

**Azioni:**
1. Click "View" su un documento → mostra JSON formattato
2. Click "Edit" → form per modificare campi
3. Prova a modificare il prezzo di un prodotto
4. Salva e verifica in mongosh

**📸 SCREENSHOT 27**: Vista collezione con documenti + form edit di un prodotto.

### Step 8.4: Esecuzione Query

**Nella collezione, cerca form "Query":**

```json
{"categoria": "Elettronica"}
```

Click "Find" → filtra solo prodotti Elettronica.

**Query avanzate:**
```json
{"prezzo": {"$gt": 100}}
```

```json
{"disponibile": true, "quantita": {"$gte": 10}}
```

**📸 SCREENSHOT 28**: Form query con filtro e risultati.

### Step 8.5: Creazione Manuale Documento

1. Click "+ New Document"
2. Inserisci JSON:
```json
{
  "nome": "Libro Python per tutti",
  "categoria": "Libri",
  "prezzo": 29.99,
  "quantita": 45,
  "disponibile": true,
  "autore": "Marco Bianchi",
  "isbn": "978-88-1234567-8",
  "pagine": 342
}
```
3. Click "Save"

**📸 SCREENSHOT 29**: Form nuovo documento e documento salvato visibile nella lista.

**Verifica in mongosh:**
```javascript
db.prodotti.findOne({ categoria: "Libri" })
```

**❓ Domande di Riflessione 17**

**R17.1** Mongo Express è utile per sviluppo/debug ma è sicuro in produzione? Quali rischi comporta avere un'interfaccia web di amministrazione esposta? Come la proteggeresti?

**R17.2** Confronta Mongo Express con mongosh. Quando preferiresti uno o l'altro? Elenca 2 vantaggi per ciascuno.

**R17.3** In Mongo Express puoi vedere gli indici della collezione (tab "Indexes"). Controlla la collezione `prodotti`. Quale indice esiste di default? Perché?

---

## 📤 Parte 9: Export/Import Dati

### Step 9.1: Esportare Collezione in JSON

```bash
# Esci da mongosh (se aperto)
exit

# Export in JSON (dall'host, fuori dal container)
docker exec mongodb_primi_passi mongoexport \
  --db=negozio \
  --collection=prodotti \
  --out=/tmp/prodotti.json \
  --jsonArray \
  --username=admin \
  --password=password123 \
  --authenticationDatabase=admin

# Copia il file dal container all'host
docker cp mongodb_primi_passi:/tmp/prodotti.json ./prodotti.json

# Visualizza contenuto
cat prodotti.json
```

**Output:** File JSON con array di documenti.

**📸 SCREENSHOT 30**: Contenuto del file `prodotti.json` esportato.

### Step 9.2: Esportare in CSV

```bash
docker exec mongodb_primi_passi mongoexport \
  --db=negozio \
  --collection=prodotti \
  --type=csv \
  --fields=nome,categoria,prezzo,quantita,disponibile \
  --out=/tmp/prodotti.csv \
  --username=admin \
  --password=password123 \
  --authenticationDatabase=admin

docker cp mongodb_primi_passi:/tmp/prodotti.csv ./prodotti.csv

cat prodotti.csv
```

**Formato CSV:**
```csv
nome,categoria,prezzo,quantita,disponibile
"Laptop Dell XPS 15","Elettronica",1399.99,15,true
"iPhone 15 Pro","Elettronica",1199.99,30,true
...
```

**📸 SCREENSHOT 31**: File CSV aperto (anche in Excel/LibreOffice va bene).

**❓ Domande di Riflessione 18**

**R18.1** Il CSV richiede `--fields` espliciti. Perché? Cosa succederebbe se non li specifichi e i documenti hanno campi diversi?

**R18.2** I campi annidati (es: `specifiche.memoria`) nel CSV come vengono gestiti? Prova ad esportare con `--fields=nome,specifiche.memoria,prezzo`. Funziona?

### Step 9.3: Importare Dati

**Crea file di test:**
```bash
cat > ./nuovi_prodotti.json << 'EOF'
[
  {
    "nome": "Mouse Logitech MX Master 3",
    "categoria": "Elettronica",
    "prezzo": 99.99,
    "quantita": 34,
    "disponibile": true
  },
  {
    "nome": "Zaino Eastpak",
    "categoria": "Accessori",
    "prezzo": 45.00,
    "quantita": 18,
    "disponibile": true
  }
]
EOF
```

**Importa:**
```bash
# Copia file nell'container
docker cp ./nuovi_prodotti.json mongodb_primi_passi:/tmp/

# Importa
docker exec mongodb_primi_passi mongoimport \
  --db=negozio \
  --collection=prodotti \
  --file=/tmp/nuovi_prodotti.json \
  --jsonArray \
  --username=admin \
  --password=password123 \
  --authenticationDatabase=admin
```

**Output:**
```
2024-05-04T20:00:00.000+0000connected to: mongodb://localhost/
2024-05-04T20:00:00.123+00002 document(s) imported successfully. 0 document(s) failed to import.
```

**Verifica:**
```bash
docker exec -it mongodb_primi_passi mongosh -u admin -p password123

use negozio
db.prodotti.countDocuments()  // Dovrebbe essere aumentato di 2
db.prodotti.find({ categoria: "Accessori" })
```

**📸 SCREENSHOT 32**: Output `mongoimport` e verifica in mongosh dei nuovi documenti.

**❓ Domande di Riflessione 19**

**R19.1** L'import aggiunge documenti alla collezione esistente. Come faresti a sovrascrivere completamente? (Suggerimento: `--mode=delete` o elimina collezione prima)

**R19.2** Cosa succede se il JSON contiene `_id` duplicati? L'import fallisce completamente o salta solo i duplicati? Prova con `--stopOnError` vs senza.

---

## 🧪 Parte 10: Esperimenti Guidati

### Esperimento 1: Schema Evolution

**Scenario:** Vuoi aggiungere campo "fornitore" a tutti i prodotti Elettronica.

```javascript
use negozio

// Aggiungi campo a documenti esistenti
db.prodotti.updateMany(
  { categoria: "Elettronica" },
  { $set: { fornitore: "Tech Distributors SRL" } }
)

// Verifica
db.prodotti.find({ categoria: "Elettronica" })

// Ora inserisci nuovo prodotto CON fornitore
db.prodotti.insertOne({
  nome: "Tastiera meccanica",
  categoria: "Elettronica",
  prezzo: 129.99,
  quantita: 22,
  fornitore: "Gaming Gear Inc",
  disponibile: true
})

// E uno SENZA fornitore
db.prodotti.insertOne({
  nome: "Cuscino ergonomico",
  categoria: "Arredamento",
  prezzo: 35.00,
  quantita: 12,
  disponibile: true
})
```

**📸 SCREENSHOT 33**: Risultati query che mostrano documenti con e senza campo "fornitore".

**Analisi:**
- Alcuni documenti hanno `fornitore`, altri no
- Nessun errore, perfettamente valido
- Questo è il vantaggio dello schema flessibile!

**Domanda:** Come gestiresti questo in SQL? Dovresti:
1. Aggiungere colonna con `ALTER TABLE` (downtime)
2. Permettere NULL
3. Migrare dati esistenti

### Esperimento 2: Aggregazioni Base

```javascript
// Conta prodotti per categoria
db.prodotti.aggregate([
  { $group: { 
      _id: "$categoria",
      totale: { $sum: 1 }
  }}
])

// Prezzo medio per categoria
db.prodotti.aggregate([
  { $group: {
      _id: "$categoria",
      prezzo_medio: { $avg: "$prezzo" }
  }}
])

// Valore inventario per categoria (prezzo * quantità)
db.prodotti.aggregate([
  { $group: {
      _id: "$categoria",
      valore_totale: { $sum: { $multiply: ["$prezzo", "$quantita"] } }
  }},
  { $sort: { valore_totale: -1 } }
])
```

**📸 SCREENSHOT 34**: Output aggregazione con valore inventario per categoria.

**❓ Domande di Riflessione 20**

**R20.1** L'aggregation pipeline usa stages (`$group`, `$sort`, etc.). È simile a SQL? Confronta con `SELECT categoria, AVG(prezzo) FROM prodotti GROUP BY categoria`. Quale sintassi preferisci?

**R20.2** Prova ad aggiungere stage `$match` prima di `$group` per calcolare prezzo medio solo prodotti disponibili. Scrivi la pipeline completa.

### Esperimento 3: Indici per Performance

```javascript
// Crea indice su categoria
db.prodotti.createIndex({ categoria: 1 })

// Crea indice composto
db.prodotti.createIndex({ categoria: 1, prezzo: -1 })

// Verifica indici
db.prodotti.getIndexes()

// Analizza query SENZA indice
db.prodotti.find({ categoria: "Elettronica" }).explain("executionStats")

// Guarda questi campi nell'output:
// - totalDocsExamined (documenti scanditi)
// - executionTimeMillis (tempo esecuzione)

// Ora con indice (già creato sopra), rianalizza
db.prodotti.find({ categoria: "Elettronica" }).explain("executionStats")
```

**📸 SCREENSHOT 35**: Output `.explain()` mostrando `totalDocsExamined` e `executionTimeMillis`.

**❓ Domande di Riflessione 21**

**R21.1** Con pochi documenti (10-20) l'indice non fa differenza. Con 1 milione di documenti, quanto cambierebbe? Cerca "MongoDB index performance" e spiega con un esempio.

**R21.2** Gli indici occupano spazio e rallentano gli inserimenti. Perché? Quando creeresti indici e quando no?

### Esperimento 4: Transazioni (Cenni)

MongoDB supporta transazioni ACID multi-documento dalla versione 4.0.

```javascript
// Inizio sessione
const session = db.getMongo().startSession();
session.startTransaction();

// Database nella sessione
const sessionDB = session.getDatabase("negozio");

try {
  // Operazione 1: Decrementa quantità prodotto
  sessionDB.prodotti.updateOne(
    { nome: "iPhone 15 Pro" },
    { $inc: { quantita: -1 } }
  );
  
  // Operazione 2: Registra vendita (nuova collezione)
  sessionDB.vendite.insertOne({
    prodotto: "iPhone 15 Pro",
    data: new Date(),
    importo: 1199.99
  });
  
  // Commit (entrambe le operazioni o nessuna)
  session.commitTransaction();
  print("Transazione completata!");
  
} catch (error) {
  // Rollback in caso di errore
  session.abortTransaction();
  print("Errore, transazione annullata:", error);
} finally {
  session.endSession();
}
```

**📸 SCREENSHOT 36**: Esecuzione transazione e verifica modifiche.

**❓ Domande di Riflessione 22**

**R22.1** Le transazioni garantiscono atomicità. Cosa significa? Perché è importante in uno scenario e-commerce?

**R22.2** MongoDB era "eventually consistent" nelle prime versioni. Con replica set e sharding, come garantisce ACID? Cerca "distributed transactions MongoDB" e spiega brevemente.

---

## 📊 Parte 11: Esercizi Pratici da Svolgere

### Esercizio 1: Database Cinema

Crea database `cinema` con collezione `film`.

**Inserisci questi film:**

```javascript
use cinema

db.film.insertMany([
  {
    titolo: "Inception",
    regista: "Christopher Nolan",
    anno: 2010,
    durata: 148,
    genere: "Sci-Fi",
    attori: ["Leonardo DiCaprio", "Ellen Page", "Tom Hardy"],
    voto_imdb: 8.8,
    incasso_milioni: 829
  },
  {
    titolo: "Il Padrino",
    regista: "Francis Ford Coppola",
    anno: 1972,
    durata: 175,
    genere: "Crime",
    attori: ["Marlon Brando", "Al Pacino", "James Caan"],
    voto_imdb: 9.2,
    incasso_milioni: 246
  },
  {
    titolo: "Parasite",
    regista: "Bong Joon-ho",
    anno: 2019,
    durata: 132,
    genere: "Thriller",
    attori: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
    voto_imdb: 8.5,
    incasso_milioni: 258
  },
  {
    titolo: "Interstellar",
    regista: "Christopher Nolan",
    anno: 2014,
    durata: 169,
    genere: "Sci-Fi",
    attori: ["Matthew McConaughey", "Anne Hathaway"],
    voto_imdb: 8.6,
    incasso_milioni: 677
  }
])
```

**Richieste:**

1. Trova tutti i film di Nolan
2. Trova film con voto IMDB >= 8.7
3. Trova film durata < 150 minuti
4. Conta film per genere
5. Film con incasso > 500 milioni
6. Film dove recita "Leonardo DiCaprio"
7. Aggiungi campo `oscar: 4` a "Il Padrino"
8. Aumenta voto_imdb di 0.1 a tutti i film Sci-Fi
9. Top 3 film per incasso
10. Crea indice su `regista`

**📸 SCREENSHOT 37**: Comandi e output di almeno 5 richieste.

### Esercizio 2: Database Scuola

Crea database `scuola` con collezione `studenti`.

**Struttura documento studente:**
```javascript
{
  nome: "Mario",
  cognome: "Rossi",
  classe: "3A",
  voti: {
    matematica: [7, 8, 6, 9],
    italiano: [6, 7, 7],
    informatica: [9, 10, 8, 9]
  },
  assenze: 5,
  data_nascita: new Date("2006-03-15")
}
```

**Inserisci 5 studenti** (inventa dati).

**Richieste:**
1. Studenti della classe 3A
2. Studenti con > 10 assenze
3. Calcola media voti matematica per ogni studente (aggregation)
4. Aggiungi voto informatica a uno studente
5. Esporta in JSON
6. Elimina studente con meno assenze

**📸 SCREENSHOT 38**: Database completo e output di almeno 3 operazioni.

### Esercizio 3: Database Ristorante

Crea database `ristorante` con collezioni `piatti` e `ordini`.

**Piatti:**
```javascript
{
  nome: "Pizza Margherita",
  categoria: "Pizze",
  prezzo: 7.50,
  ingredienti: ["pomodoro", "mozzarella", "basilico"],
  vegetariano: true,
  piccante: false
}
```

**Ordini:**
```javascript
{
  numero: 1,
  data: new Date(),
  tavolo: 5,
  piatti: [
    { nome: "Pizza Margherita", quantita: 2 },
    { nome: "Coca Cola", quantita: 2 }
  ],
  totale: 19.00,
  pagato: false
}
```

**Richieste:**
1. Piatti vegetariani
2. Piatti categoria "Pizze" con prezzo < 10
3. Conta quanti piatti hanno ingrediente "mozzarella"
4. Crea 3 ordini (inventa)
5. Trova ordini non pagati
6. Segna ordine come pagato
7. Calcola incasso totale ordini pagati

**📸 SCREENSHOT 39**: Strutture dati create e query significative.

---

## 📄 Parte 12: Documentazione Finale e Consegna

### Template Documento Google

```
═══════════════════════════════════════════════
       LABORATORIO 02: MONGODB SHELL
═══════════════════════════════════════════════

Studente: [Nome Cognome]
Classe: [Classe]
Data: [GG/MM/AAAA]

═══════════════════════════════════════════════

INDICE

1. Introduzione e Obiettivi
2. Architettura del Sistema
3. Setup e Configurazione
4. Comandi Base MongoDB Shell
5. Inserimenti e Strutture Dati
6. Query e Filtri
7. Proiezioni e Ordinamento
8. Aggiornamenti
9. Mongo Express
10. Export/Import
11. Esperimenti
12. Esercizi Pratici
13. Conclusioni

═══════════════════════════════════════════════

1. INTRODUZIONE E OBIETTIVI

[Descrivi brevemente MongoDB e mongosh]
[Cosa ti aspetti di imparare]

═══════════════════════════════════════════════

2. ARCHITETTURA DEL SISTEMA

2.1 Diagramma
[SCREENSHOT 1]

Risposte Domande di Riflessione 1:
R1.1 Schema-less vs schema-based:
[...]

R1.2 Documenti con campi diversi:
[...]

R1.3 ObjectId vs numeri auto-incrementali:
[...]

R1.4 Schema persistenza dati:
[SCREENSHOT 2: disegno]

═══════════════════════════════════════════════

3. SETUP E CONFIGURAZIONE

[SCREENSHOT 3: file .env]
[SCREENSHOT 4: docker-compose.yml]
[SCREENSHOT 5: docker compose up]
[SCREENSHOT 6: docker compose ps]

Risposte Domande di Riflessione 2-3:
[...]

═══════════════════════════════════════════════

4. COMANDI BASE MONGODB SHELL

[SCREENSHOT 7-10: comandi mongosh]

Comandi eseguiti:
```
show dbs
use negozio
db.prodotti.insertOne({...})
```

Risposte Domande di Riflessione 4-6:
[...]

═══════════════════════════════════════════════

[...continua con tutte le sezioni...]

═══════════════════════════════════════════════

13. CONCLUSIONI

13.1 Competenze Acquisite

Ho imparato a:
1. [...]
2. [...]
3. [...]
4. [...]
5. [...]

13.2 Confronto MongoDB vs SQL

Vantaggi MongoDB:
- [...]
- [...]

Svantaggi MongoDB:
- [...]
- [...]

Quando usare MongoDB:
[...]

Quando usare SQL:
[...]

13.3 Difficoltà Incontrate

[Descrivi problemi e soluzioni]

13.4 Riflessione Personale

[Minimo 150 parole sulla tua esperienza]

13.5 Applicazioni Future

[Come applicheresti MongoDB in un progetto reale?]

═══════════════════════════════════════════════
```

### Checklist di Controllo

**Screenshot (minimo 20):**
- [ ] Screenshot 1-6: Setup e configurazione
- [ ] Screenshot 7-11: Comandi base e inserimenti
- [ ] Screenshot 12-16: Query e filtri
- [ ] Screenshot 17-20: Proiezioni e aggiornamenti
- [ ] Screenshot 21-24: Eliminazioni
- [ ] Screenshot 25-29: Mongo Express
- [ ] Screenshot 30-32: Export/Import
- [ ] Screenshot 33-36: Esperimenti
- [ ] Screenshot 37-39: Esercizi pratici

**Risposte Domande (tutte le 22 serie):**
- [ ] R1.1 - R1.4 (Architettura)
- [ ] R2.1 - R2.3 (Docker Compose)
- [ ] R3.1 - R3.3 (Setup)
- [ ] R4.1 - R4.3 (Comandi base)
- [ ] R5.1 - R5.2 (Database)
- [ ] R6.1 - R6.3 (Collezioni e ObjectId)
- [ ] R7.1 - R7.4 (Strutture dati)
- [ ] R8.1 - R8.3 (Documenti annidati)
- [ ] R9.1 - R9.2 (Query comparazione)
- [ ] R10.1 - R10.3 (Query array)
- [ ] R11.1 - R11.2 (Dot notation)
- [ ] R12.1 - R12.2 (Proiezioni)
- [ ] R13.1 - R13.3 (Ordinamento)
- [ ] R14.1 - R14.3 (UpdateOne)
- [ ] R15.1 - R15.2 (Upsert)
- [ ] R16.1 - R16.2 (Eliminazioni)
- [ ] R17.1 - R17.3 (Mongo Express)
- [ ] R18.1 - R18.2 (Export CSV)
- [ ] R19.1 - R19.2 (Import)
- [ ] R20.1 - R20.2 (Aggregazioni)
- [ ] R21.1 - R21.2 (Indici)
- [ ] R22.1 - R22.2 (Transazioni)

**Esercizi Pratici:**
- [ ] Esercizio 1: Cinema (10 richieste)
- [ ] Esercizio 2: Scuola (6 richieste)
- [ ] Esercizio 3: Ristorante (7 richieste)

**Sezione Conclusioni:**
- [ ] Almeno 5 competenze acquisite elencate
- [ ] Confronto MongoDB vs SQL
- [ ] Difficoltà documentate con soluzioni
- [ ] Riflessione personale (≥ 150 parole)
- [ ] Applicazioni future proposte

### Criteri di Valutazione

| Criterio | Peso | Descrizione |
|----------|------|-------------|
| **Completezza** | 30% | Tutti screenshot, risposte, esercizi presenti |
| **Correttezza tecnica** | 25% | Comandi corretti, risposte accurate |
| **Comprensione concetti** | 20% | Dimostra di aver capito il "perché" |
| **Esercizi pratici** | 15% | Creatività e correttezza esercizi |
| **Riflessione critica** | 10% | Analisi MongoDB vs SQL, casi d'uso |

**Punteggi:**
- **< 60%**: Insufficiente - Completare parti mancanti
- **60-70%**: Sufficiente - Base soddisfatta
- **70-80%**: Buono - Lavoro completo
- **80-90%**: Ottimo - Approfondimenti significativi
- **90-100%**: Eccellente - Padronanza e creatività

### Consegna

**Modalità:**
1. Documento Google Drive
2. Link condivisibile (visualizzazione)
3. Anche PDF come backup

**Formato nome:** `Lab02_MongoDB_Shell_[CognomeNome]_[Classe].pdf`

**Deadline:** [Da definire]

---

## 🔗 Risorse e Approfondimenti

### Documentazione Ufficiale

- **MongoDB Manual:** https://www.mongodb.com/docs/manual/
- **MongoDB Shell (mongosh):** https://www.mongodb.com/docs/mongodb-shell/
- **BSON Types:** https://www.mongodb.com/docs/manual/reference/bson-types/
- **Query Operators:** https://www.mongodb.com/docs/manual/reference/operator/query/
- **Aggregation:** https://www.mongodb.com/docs/manual/aggregation/

### Tutorial Interattivi

- **MongoDB University:** https://university.mongodb.com/ (M001: MongoDB Basics)
- **W3Schools MongoDB:** https://www.w3schools.com/mongodb/
- **Learn MongoDB:** https://www.mongodb.com/docs/guides/

### Tools

- **MongoDB Compass:** GUI desktop (alternativa Mongo Express)
- **Studio 3T:** Client avanzato
- **NoSQLBooster:** IDE per MongoDB

### Confronto MongoDB vs SQL

- Quando usare NoSQL: https://www.mongodb.com/nosql-explained
- SQL to MongoDB Mapping: https://www.mongodb.com/docs/manual/reference/sql-comparison/

---

## 🆘 Supporto

**Problemi tecnici comuni:**

1. **Container non si avvia:**
   ```bash
   docker compose down
   sudo rm -rf volumes/mongo-data/*
   docker compose up -d
   ```

2. **Errore autenticazione:**
   - Verifica credenziali in `.env`
   - Usa `docker compose restart mongodb`

3. **Mongo Express non si connette:**
   - Attendi 30-40 secondi per healthcheck MongoDB
   - Controlla log: `docker compose logs mongo-express`

4. **Porta già in uso:**
   - Cambia porte in `docker-compose.yml`
   - Oppure ferma altri servizi: `sudo lsof -i :27017`

**Contatti:**
- Email docente: [...]
- Forum: [...]
- Orari ricevimento: [...]

---

## 📜 Note Finali

**Obiettivo di questo laboratorio:**

Non è memorizzare comandi a memoria, ma:
✓ **Comprendere** il modello dati NoSQL
✓ **Sperimentare** con flessibilità dello schema
✓ **Confrontare** approcci SQL vs NoSQL
✓ **Riflettere** su quando usare uno o l'altro

> *"Il miglior modo per imparare MongoDB è romperlo e ricostruirlo"*

**Consigli:**
- Prova comandi "pericolosi" in ambiente locale (non in produzione!)
- Sperimenta con dati diversi
- Confronta le soluzioni con i compagni
- Documenta gli errori (sono parte dell'apprendimento!)

**Buon lavoro! 🚀**

---

**Fine del Laboratorio 02**
