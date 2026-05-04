# 🎓 Laboratorio: MongoDB + Node.js + Mongo Express

## Obiettivi Didattici

Al termine di questa esercitazione lo studente sarà in grado di:

1. **Comprendere l'architettura a microservizi** con container Docker
2. **Progettare e implementare** un database NoSQL con MongoDB
3. **Creare REST API** per operazioni CRUD con Node.js ed Express
4. **Utilizzare strumenti di amministrazione** database (Mongo Express, mongosh)
5. **Testare e debuggare** applicazioni distribuite su più container
6. **Documentare il lavoro** con screenshot e riflessioni critiche

---

## 📋 Modalità di Consegna

**Creare un documento Google** con:

1. **Copertina**: Nome, Cognome, Classe, Data
2. **Indice**: Numerato con le sezioni dell'esercitazione
3. **Screenshot**: Per ogni sezione indicata con 📸
4. **Risposte alle domande di riflessione**: Indicate con ❓
5. **Conclusioni personali**: Cosa hai imparato, difficoltà incontrate, miglioramenti possibili

**Formato screenshot**: 
- Risoluzione leggibile (almeno 1280px larghezza)
- Evidenziare con frecce/cerchi gli elementi importanti
- Aggiungere didascalie esplicative

**Consegna**: Link al documento Google condiviso con permessi di visualizzazione

---

## 📚 Applicazione: Biblioteca Digitale

L'applicazione è un sistema di gestione biblioteca con interfaccia web e REST API complete.

```
volumes/
├── app/
│   ├── server.js         ← Backend Express + MongoDB
│   ├── package.json      ← Dipendenze Node.js
│   └── public/
│       └── index.html    ← Frontend (HTML + CSS + JS)
├── init-mongo.js         ← Script inizializzazione DB
└── mongo-data/           ← Dati MongoDB (persistenti)
```

### Funzionalità

| Feature | Descrizione |
|---------|-------------|
| **CRUD completo** | Crea, leggi, aggiorna, elimina libri |
| **Ricerca** | Cerca per titolo, autore o genere |
| **Statistiche** | Dashboard con contatori in tempo reale |
| **REST API** | Endpoint JSON per tutte le operazioni |
| **Mongo Express** | GUI web per gestione database |
| **Auto-init DB** | Database e collezioni create automaticamente |

### API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/health` | GET | Health check dell'applicazione |
| `/api/libri` | GET | Lista tutti i libri |
| `/api/libri/:id` | GET | Dettagli di un libro specifico |
| `/api/libri` | POST | Crea nuovo libro |
| `/api/libri/:id` | PUT | Aggiorna libro esistente |
| `/api/libri/:id` | DELETE | Elimina libro |
| `/api/cerca/:query` | GET | Ricerca libri per testo |
| `/api/stats` | GET | Statistiche biblioteca |

---

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────┐
│              mongodb_network (bridge)           │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐ │
│  │  mongodb     │  │  nodejs_app  │  │ mongo- │ │
│  │  MongoDB 7.0 │◄─┤  Node.js 20  │  │express │ │
│  │  porta 27017 │  │  porta 3000  │  │ porta  │ │
│  │              │  │              │  │  8081  │ │
│  └──────────────┘  └──────────────┘  └────────┘ │
└─────────────────────────────────────────────────┘
```

### Servizi

| Servizio | Immagine | Container | Porta | Ruolo |
|----------|----------|-----------|-------|-------|
| `mongodb` | `mongo:7.0` | `mongodb_server` | 27017 | Database NoSQL |
| `nodejs-app` | `node:20-alpine` | `nodejs_app` | 3000 | Backend REST API |
| `mongo-express` | `mongo-express:latest` | `mongo_express_ui` | 8081 | GUI amministrazione |

### Volumi e mount

| Sorgente (host) | Destinazione (container) | Descrizione |
|---|---|---|
| `./volumes/app/` | `/usr/src/app/` | Codice Node.js |
| `./volumes/mongo-data/` | `/data/db/` | Dati MongoDB persistenti |
| `./volumes/init-mongo.js` | `/docker-entrypoint-initdb.d/` | Script inizializzazione |

---

---

## 🚀 Parte 2: Setup dell'Ambiente

### Prerequisiti

Verifica di avere:
- Docker Engine ≥ 24
- Docker Compose v2
- 2 GB RAM liberi
- Porte disponibili: 3000, 8081, 27017

**Verifica installazione Docker:**
```bash
docker --version
docker compose version
```

### Step 2.1: Analisi dei File di Configurazione

Prima di avviare, **leggi e comprendi** i file di configurazione.

#### 📄 File `.env.example`

```bash
# Visualizza il contenuto
cat .env.example
```

**Cosa contiene:**
- Credenziali MongoDB (username/password amministratore)
- Nome del database da creare
- Credenziali Mongo Express (interfaccia web)

**🔐 Nota sulla Sicurezza:**
- `.env` è nel `.gitignore` → **non viene committato** su Git
- In produzione, usa password forti e gestori di segreti (Vault, AWS Secrets)
- Mai hardcodare password nel codice!

```bash
# Copia il template e personalizza (OBBLIGATORIO)
cp .env.example .env
nano .env  # o vim/code per modificare
```

**📸 SCREENSHOT 1**: Mostra il contenuto del tuo file `.env` personalizzato (offusca le password se preferisci).

#### 📄 File `docker-compose.yml`

```bash
# Visualizza la struttura
cat docker-compose.yml
```

**Analizza le sezioni principali:**

| Sezione | Significato |
|---------|-------------|
| `services:` | Definisce i 3 container da creare |
| `networks:` | Crea la rete bridge condivisa |
| `volumes:` | Mapping cartelle host → container |
| `depends_on:` | Definisce l'ordine di avvio |
| `environment:` | Variabili d'ambiente da `.env` |
| `healthcheck:` | Test per verificare che il servizio sia pronto |

**❓ Domande di Riflessione 2**

**R2.1** Cerca la sezione `healthcheck` del servizio `mongodb`. Cosa fa il comando `mongosh --eval "db.adminCommand('ping')"`? Perché è importante che questo comando abbia successo prima di avviare gli altri servizi?

**R2.2** Il servizio `nodejs-app` ha `command: npm run dev`. Cerca cosa fa questo comando nel `package.json`. Perché usiamo `nodemon` invece di `node` direttamente?

**R2.3** Perché il volume `./volumes/app` è montato in `/usr/src/app`? Cosa succederebbe se modifichi `server.js` sul tuo computer?

### Step 2.2: Avvio dei Container

```bash
# Avvia tutti i servizi in background (-d = detached)
docker compose up -d
```

**Cosa succede dietro le quinte:**

1. Docker scarica le immagini (se non presenti): mongo:7.0, node:20-alpine, mongo-express
2. Crea la rete `mongodb_network`
3. Crea i volumi per persistenza dati
4. Avvia i container nell'ordine corretto:
   - Prima: `mongodb` (nessuna dipendenza)
   - Poi: `nodejs-app` e `mongo-express` (attendono MongoDB healthy)

**Tempo stimato:** 2-3 minuti al primo avvio (download immagini).

**📸 SCREENSHOT 2**: Output completo del comando `docker compose up -d` mostrando il download delle immagini.

### Step 2.3: Verifica dello Stato

```bash
# Mostra lo stato dei container
docker compose ps
```

**Output atteso:**
```
NAME               IMAGE                 STATUS
mongodb_server     mongo:7.0             Up (healthy)
nodejs_app         01-mongodb-nodejs...  Up
mongo_express_ui   mongo-express         Up
```

**⚠️ Troubleshooting:**

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| `Exit 1` su mongodb | Dati corrotti | `docker compose down && rm -rf volumes/mongo-data/*` |
| `Exit 0` su nodejs | Errore nel codice | `docker compose logs nodejs-app` |
| Porta in uso | Altro servizio sulla porta | Cambia le porte in `docker-compose.yml` |

**📸 SCREENSHOT 3**: Output di `docker compose ps` con tutti i container "Up".

### Step 2.4: Monitoraggio dei Log

```bash
# Segui i log in tempo reale (Ctrl+C per uscire)
docker compose logs -f
```

**Messaggi chiave da cercare:**

```
✅ mongodb_server   | MongoDB init process complete
✅ nodejs_app       | ✅ Connesso a MongoDB!
✅ nodejs_app       | 🚀 Server in esecuzione su http://localhost:3000
✅ mongo_express_ui | Mongo Express server listening at http://0.0.0.0:8081
```

**📸 SCREENSHOT 4**: Log che mostrano l'avvio completo di tutti e 3 i servizi.

**❓ Domande di Riflessione 3**

**R3.1** Nei log di `nodejs_app`, cerca la riga di connessione a MongoDB. Quale URI viene usato? Perché non è `localhost:27017`?

**R3.2** Osserva i log di `mongodb_server`. Cerca riferimenti al file `init-mongo.js`. Quando viene eseguito questo script? Quante volte viene eseguito (al primo avvio, a ogni riavvio, sempre)?

**R3.3** Se vedi errori di connessione iniziali di `nodejs-app` o `mongo-express`, sono normali? Perché sì o perché no? Come fa Docker Compose a gestire questi "retry"?

---

---

## 🧪 Parte 3: Test del Frontend

### Step 3.1: Apertura dell'Interfaccia Web

Apri il browser su: **http://localhost:3000**

**Cosa dovresti vedere:**
- Header viola/blu con titolo "📚 Biblioteca Digitale"
- 3 card statistiche con numeri grandi:
  - Libri Totali
  - Disponibili
  - In Prestito
- Barra di ricerca bianca
- Griglia di card con 5 libri iniziali

**📸 SCREENSHOT 5**: Vista completa della pagina iniziale con tutti gli elementi visibili.

### Step 3.2: Analisi dei Dati Iniziali

Osserva attentamente i libri visualizzati. Lo script `init-mongo.js` ha creato 5 libri:

| Titolo | Autore | Anno | Genere | Disponibile | Tags |
|--------|--------|------|--------|-------------|------|
| Il nome della rosa | Umberto Eco | 1980 | Romanzo storico | ✓ | classico, italiano, mistero |
| 1984 | George Orwell | 1949 | Distopia | ✓ | classico, distopia, politica |
| Il Signore degli Anelli | J.R.R. Tolkien | 1954 | Fantasy | ✓ | fantasy, epico, avventura |
| Harry Potter | J.K. Rowling | 1997 | Fantasy | ✗ | fantasy, young adult, magia |
| Il Piccolo Principe | Antoine de Saint-Exupéry | 1943 | Romanzo | ✓ | classico, infanzia, filosofia |

**❓ Domande di Riflessione 4**

**R4.1** Le statistiche mostrano "Libri Totali: 5". Apri gli strumenti per sviluppatori del browser (F12) → scheda Network → ricarica la pagina. Quale chiamata API viene fatta per ottenere le statistiche? Copia l'URL completo.

**R4.2** Quali sono i campi obbligatori di un libro? Quali sono opzionali? Come lo hai capito guardando i dati?

**R4.3** Harry Potter è l'unico libro "Non disponibile". Cosa significa questo nel contesto di una biblioteca? Come potrebbe influenzare la logica del sistema di prestiti?

### Step 3.3: Test della Funzionalità di Ricerca

**Test 1 - Ricerca per autore:**
1. Digita `Tolkien` nella barra
2. Click su "🔍 Cerca"
3. Risultato atteso: solo "Il Signore degli Anelli"

**Test 2 - Ricerca per genere:**
1. Digita `Fantasy`
2. Click su "🔍 Cerca"
3. Risultato atteso: 2 libri (Tolkien e Rowling)

**Test 3 - Ricerca case-insensitive:**
1. Digita `tolkien` (minuscolo)
2. Click su "🔍 Cerca"
3. Risultato atteso: stessa cosa del Test 1 (la ricerca ignora maiuscole/minuscole)

**Test 4 - Ricerca parziale:**
1. Digita `Pic`
2. Click su "🔍 Cerca"
3. Risultato atteso: "Il Piccolo Principe"

**📸 SCREENSHOT 6**: Risultato della ricerca "Fantasy" mostrando i 2 libri trovati.

**❓ Domande di Riflessione 5**

**R5.1** Apri il file `volumes/app/public/index.html` e cerca la funzione `searchBooks()`. Come viene costruito l'URL della chiamata API? Includi lo snippet di codice nel documento.

**R5.2** Nel file `volumes/app/server.js`, cerca l'endpoint `/api/cerca/:query`. Quale operatore MongoDB viene usato per la ricerca? Perché usa `$regex` invece di una ricerca esatta?

**R5.3** Prova a cercare "zzzz" (testo che non esiste). Cosa viene visualizzato? È user-friendly? Come miglioreresti il messaggio?

### Step 3.4: Analisi del Codice Frontend

Apri `volumes/app/public/index.html` e analizza:

**Sezione HTML (linee 1-100):**
- Struttura semantica
- Card bootstrap-like
- Badges per disponibilità

**Sezione CSS (linee 10-80):**
- Gradiente viola/blu nel background
- Card con hover effect (si sollevano)
- Badge colorati (verde/rosso)

**Sezione JavaScript (linee 100-200):**
- Fetch API per chiamate HTTP
- Rendering dinamico con template literals
- Event listener per ricerca

**❓ Domande di Riflessione 6**

**R6.1** Nel CSS, cerca la regola `.book-card:hover`. Cosa fa `transform: translateY(-5px)`? Perché migliora l'esperienza utente?

**R6.2** Nel JavaScript, cerca la funzione `displayBooks()`. Usa `innerHTML` per iniettare HTML. Quali rischi di sicurezza comporta? (Cerca "XSS attack" per approfondire)

**R6.3** Le chiamate API usano `async/await`. Riscrivi la funzione `loadBooks()` usando le Promises con `.then()` e `.catch()` invece. Quale approccio preferisci e perché?

[alt text](assets/image1.png)│

---

## 📡 Parte 4: Test delle API REST

### Cos'è una REST API?

**REST** = Representational State Transfer

Principi fondamentali:
- **Client-Server**: separazione tra frontend e backend
- **Stateless**: ogni richiesta è indipendente (no sessioni server-side)
- **Uniform Interface**: URL standard e metodi HTTP (GET, POST, PUT, DELETE)
- **JSON**: formato standard per scambio dati

**Metodi HTTP e operazioni CRUD:**

| HTTP Method | CRUD Operation | Esempio |
|-------------|----------------|---------|
| GET | Read | `GET /api/libri` → lista tutti |
| POST | Create | `POST /api/libri` → crea nuovo |
| PUT | Update | `PUT /api/libri/123` → aggiorna |
| DELETE | Delete | `DELETE /api/libri/123` → elimina |

### Step 4.1: Health Check

```bash
curl http://localhost:3000/api/health
```

**Output atteso:**
```json
{
  "status": "ok",
  "database": "biblioteca",
  "timestamp": "2026-05-04T19:33:35.726Z"
}
```

**Analisi della risposta:**
- `status: ok` → server funzionante
- `database: biblioteca` → connesso al DB giusto
- `timestamp` → ISO 8601 format (standard internazionale)

**📸 SCREENSHOT 7**: Output del comando curl per health check.

**❓ Domande di Riflessione 7**

**R7.1** Apri `server.js` e cerca l'endpoint `/api/health`. Cosa fa `db.admin().ping()`? Perché è importante verificare anche il database e non solo il server Node.js?

**R7.2** Cosa succederebbe se MongoDB fosse down ma Node.js funzionante? Prova a fermare solo MongoDB con `docker compose stop mongodb` e richiama l'health check. Documenta l'errore.

### Step 4.2: Lettura Dati (GET)

**Test 1 - Lista completa:**
```bash
curl http://localhost:3000/api/libri | python3 -m json.tool
```

**Cosa fa `| python3 -m json.tool`?**
- Formatta il JSON in modo leggibile (pretty-print)
- Indenta correttamente
- Evidenzia la struttura

**Analisi della risposta:**
```json
{
    "success": true,
    "count": 5,
    "data": [
        {
            "_id": "69f8f445a580a2ade23d88b3",
            "titolo": "Il nome della rosa",
            "autore": "Umberto Eco",
            ...
        }
    ]
}
```

- `success`: indica se la richiesta è andata a buon fine
- `count`: numero di risultati
- `data`: array di oggetti libro
- `_id`: ObjectId MongoDB (univoco, auto-generato)

**📸 SCREENSHOT 8**: Output formattato di `curl .../api/libri` mostrando almeno 2 libri completi.

**Test 2 - Statistiche:**
```bash
curl http://localhost:3000/api/stats | python3 -m json.tool
```

**Analisi della risposta:**
```json
{
    "success": true,
    "data": {
        "totale": 5,
        "disponibili": 4,
        "non_disponibili": 1,
        "generi": [
            {"_id": "Fantasy", "count": 2},
            {"_id": "Distopia", "count": 1}
        ]
    }
}
```

**Nota:** `generi` usa una **aggregation pipeline** di MongoDB per raggruppare.

**Test 3 - Ricerca:**
```bash
curl http://localhost:3000/api/cerca/fantasy | python3 -m json.tool
```

**❓ Domande di Riflessione 8**

**R8.1** Nell'output di `/api/libri`, l'`_id` è una stringa esadecimale di 24 caratteri. Cosa rappresenta? Cerca informazioni su "MongoDB ObjectId" e spiega come è composto (timestamp, machine id, process id, counter).

**R8.2** Confronta la risposta di `/api/stats` con il codice in `server.js`. Trova l'aggregation pipeline e spiega cosa fa `$group`. Includi il codice nel documento.

**R8.3** Prova a chiamare un endpoint inesistente: `curl http://localhost:3000/api/fake`. Quale status code HTTP ricevi? Cosa significa? (Cerca "HTTP status codes").

### Step 4.3: Creazione Dati (POST)

```bash
curl -X POST http://localhost:3000/api/libri \
  -H "Content-Type: application/json" \
  -d '{
    "titolo": "Il vecchio e il mare",
    "autore": "Ernest Hemingway",
    "anno": 1952,
    "genere": "Romanzo",
    "copie": 3,
    "disponibile": true,
    "tags": ["classico", "americano", "premio Pulitzer"]
  }' | python3 -m json.tool
```

**Analisi del comando:**
- `-X POST`: specifica il metodo HTTP POST
- `-H "Content-Type: application/json"`: header che indica formato JSON
- `-d '{...}'`: body della richiesta con i dati del libro

**Output atteso:**
```json
{
    "success": true,
    "data": {
        "_id": "...",
        "titolo": "Il vecchio e il mare",
        "autore": "Ernest Hemingway",
        "data_inserimento": "2026-05-04T20:10:15.123Z"
    }
}
```

**Verifica inserimento:**
```bash
curl http://localhost:3000/api/libri | python3 -m json.tool
# Ora dovresti vedere 6 libri invece di 5
```

**📸 SCREENSHOT 9**: 
- Comando curl POST con output che mostra il nuovo libro inserito
- Screenshot del frontend ricaricato che mostra il 6° libro

**❓ Domande di Riflessione 9**

**R9.1** Nel file `server.js`, cerca l'endpoint POST `/api/libri`. Viene fatto un controllo sui dati ricevuti? (Cerca validation). Cosa succede se invii un libro senza titolo o con anno non numerico?

**R9.2** Il campo `data_inserimento` viene aggiunto automaticamente. Cerca nel codice dove viene fatto. Perché è utile tracciare quando un documento è stato creato?

**R9.3** **Esperimento**: Prova a inserire un libro con un campo extra non previsto, esempio `"isbn": "978-1234567890"`. Il database lo accetta? Cosa ci dice questo sulla flessibilità dello schema NoSQL rispetto a SQL?

### Step 4.4: Aggiornamento Dati (PUT)

Prima, trova l'ID di un libro:
```bash
curl -s http://localhost:3000/api/libri | python3 -m json.tool | grep -A 3 "Hemingway"
# Copia l'_id che viene mostrato
```

Poi aggiorna:
```bash
# Sostituisci YOUR_BOOK_ID con l'ID copiato
curl -X PUT http://localhost:3000/api/libri/YOUR_BOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "copie": 5,
    "disponibile": true
  }' | python3 -m json.tool
```

**Importante:** PUT aggiorna solo i campi specificati (partial update con `$set`).

**📸 SCREENSHOT 10**: Comando PUT e output che mostra "modifiedCount: 1".

**❓ Domande di Riflessione 10**

**R10.1** Nel codice `server.js`, l'endpoint PUT usa `updateOne()` con `$set`. Qual è la differenza tra `updateOne()` e `replaceOne()`? Quando useresti uno o l'altro?

**R10.2** Cosa succederebbe se provi ad aggiornare un libro con un ID inesistente? Prova con `curl -X PUT .../api/libri/111111111111111111111111` e documenta la risposta.

### Step 4.5: Eliminazione Dati (DELETE)

```bash
# Usa l'ID del libro di Hemingway
curl -X DELETE http://localhost:3000/api/libri/YOUR_BOOK_ID | python3 -m json.tool
```

**Output atteso:**
```json
{
    "success": true,
    "deletedCount": 1
}
```

**Verifica:**
```bash
curl http://localhost:3000/api/stats | python3 -m json.tool
# Totale dovrebbe essere tornato a 5
```

**📸 SCREENSHOT 11**: Output del DELETE e statistiche aggiornate.

**❓ Domande di Riflessione 11**

**R11.1** L'eliminazione è **permanente** (hard delete). In un sistema reale, useresti questo approccio? Cerca "soft delete pattern" e spiega come funziona. Quale campo aggiungeresti al documento?

**R11.2** Nel codice `server.js`, l'endpoint DELETE usa `deleteOne()`. Esiste anche `deleteMany()`. Quando useresti `deleteMany()`? Fai un esempio pratico (es: "elimina tutti i libri di un autore").

---

## 🖥️ Parte 5: Mongo Express - Interfaccia di Amministrazione

### Cos'è Mongo Express?

**Mongo Express** è un'interfaccia web per:
- Visualizzare database e collezioni
- Eseguire query interattive
- Modificare/eliminare documenti
- Creare indici
- Visualizzare statistiche

**Alternativa:** MongoDB Compass (desktop app ufficiale).

### Step 5.1: Accesso all'Interfaccia

Apri nel browser: **http://localhost:8081**

**Schermata di login:**
- Username: `admin`
- Password: `admin123`

**📸 SCREENSHOT 12**: Schermata di login di Mongo Express.

### Step 5.2: Esplorazione del Database

Dopo il login:

1. **Home page**: Lista di tutti i database
   - Cerca `biblioteca` (il nostro)
   - Nota anche `admin`, `config`, `local` (database di sistema MongoDB)

2. **Click su `biblioteca`**: Mostra le collezioni
   - `libri` (la nostra collezione)
   - Statistiche: numero documenti, dimensione

3. **Click su `libri`**: Mostra tutti i documenti
   - Formato JSON leggibile
   - Ogni documento su una riga
   - Pulsanti Edit e Delete

**📸 SCREENSHOT 13**: Vista della collezione `libri` con tutti i documenti visibili.

**❓ Domande di Riflessione 12**

**R12.1** Nella vista della collezione, cerca l'icona degli indici (solitamente "Indexes" o "Indici"). Quanti indici sono presenti? Quali campi indicizzano? (Guarda il file `init-mongo.js` per confrontare)

**R12.2** Clicca su "View" di un documento. Osserva la struttura JSON completa. I campi sono in ordine alfabetico o nell'ordine di inserimento? MongoDB garantisce l'ordine dei campi?

### Step 5.3: Eseguire Query Manuali

In Mongo Express, vai su "Simple" o "Advanced":

**Query 1 - Libri disponibili:**
```json
{"disponibile": true}
```
Click "Find" → dovrebbe mostrare 4 libri

**Query 2 - Libri Fantasy:**
```json
{"genere": "Fantasy"}
```

**Query 3 - Libri dopo il 1950:**
```json
{"anno": {"$gt": 1950}}
```

**Query 4 - Libri con tag "classico":**
```json
{"tags": "classico"}
```

**📸 SCREENSHOT 14**: Una query eseguita con successo mostrando i risultati.

**❓ Domande di Riflessione 13**

**R13.1** Prova una query combinata: libri Fantasy E disponibili. Quale sintassi usi? (Cerca "MongoDB $and operator")

**R13.2** Usa la query `{"copie": {"$gte": 3}}` per trovare libri con 3+ copie. Quanti ne trovi? Elencali.

**R13.3** **Esperimento avanzato**: Usa Mongo Express per **modificare manualmente** un documento. Cambia il titolo di un libro. Poi ricarica il frontend: vedi il cambiamento? Cosa ci insegna questo sul flusso dei dati?

### Step 5.4: Creazione Manuale di un Documento

1. Click su "+ New Document"
2. Inserisci questo JSON:
```json
{
  "titolo": "Moby Dick",
  "autore": "Herman Melville",
  "anno": 1851,
  "genere": "Avventura",
  "disponibile": true,
  "copie": 2,
  "tags": ["classico", "mare", "filosofia"]
}
```
3. Click "Save"

**📸 SCREENSHOT 15**: Documento "Moby Dick" appena creato visibile nella collezione.

**Verifica nel frontend:**
- Ricarica http://localhost:3000
- Dovresti vedere Moby Dick nella lista
- Le statistiche sono aggiornate?

**❓ Domande di Riflessione 14**

**R14.1** Quando hai creato il documento, hai specificato un `_id`? Se no, chi lo ha generato? Copia l'`_id` di Moby Dick e analizzalo: le prime cifre rappresentano il timestamp, prova a decodificarlo (cerca "ObjectId decoder online").

**R14.2** Confronta questa modalità di inserimento (GUI) con quella via API (curl POST). Quale preferiresti in produzione? Perché?

---

## 💻 Parte 6: MongoDB Shell - Interfaccia a Riga di Comando

### Cos'è mongosh?

**mongosh** = MongoDB Shell (sostituisce il vecchio `mongo`)

È un'interfaccia JavaScript interattiva per:
- Eseguire query e comandi admin
- Scripting e automazione
- Debugging e troubleshooting
- Esportazione/importazione dati

### Step 6.1: Accesso al Container MongoDB

```bash
# Entra nel container e avvia mongosh
docker exec -it mongodb_server mongosh
```

**Output:**
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/?directConnection=true
Using MongoDB: 7.0.0
Using Mongosh: 2.x.x
```

### Step 6.2: Autenticazione

MongoDB richiede autenticazione se abilitata:

```javascript
// Passa al database admin
use admin

// Autentica con credenziali da .env
db.auth('admin', 'password123')
// Output: { ok: 1 }
```

**📸 SCREENSHOT 16**: Terminale con mongosh connesso e autenticato.

### Step 6.3: Comandi Base

```javascript
// Mostra tutti i database
show dbs
// Output: admin, biblioteca, config, local

// Passa al database biblioteca
use biblioteca
// Output: switched to db biblioteca

// Mostra le collezioni
show collections
// Output: libri

// Conta i documenti
db.libri.countDocuments()
// Output: 6 (o il numero attuale)
```

**❓ Domande di Riflessione 15**

**R15.1** Esegui `show dbs` e nota le dimensioni dei database. Perché il database `admin` è più grande di `biblioteca` anche se non ha documenti nostri?

**R15.2** Esegui `db.getName()` per confermare il database corrente. Poi esegui `db` (senza nulla). Sono equivalenti? Cosa restituiscono?

### Step 6.4: Query di Lettura

```javascript
// Trova tutti i libri (formattato)
db.libri.find().pretty()

// Conta per verifica
db.libri.countDocuments()

// Trova libri disponibili
db.libri.find({ disponibile: true })

// Trova libri Fantasy
db.libri.find({ genere: "Fantasy" })

// Trova libro specifico per titolo
db.libri.findOne({ titolo: "1984" })

// Proiezione: mostra solo titolo e autore
db.libri.find({}, { titolo: 1, autore: 1, _id: 0 })

// Ordinamento per anno (crescente)
db.libri.find().sort({ anno: 1 })

// Limit: primi 3 libri
db.libri.find().limit(3)
```

**📸 SCREENSHOT 17**: Output di `db.libri.find().pretty()` mostrando almeno 3 documenti completi.

**❓ Domande di Riflessione 16**

**R16.1** Esegui `db.libri.find({ copie: { $gt: 2 } })`. Quanti libri hanno più di 2 copie? Elencali con titolo e numero copie.

**R16.2** La proiezione `{ titolo: 1, autore: 1, _id: 0 }` esclude l'`_id`. Perché devi specificarlo esplicitamente? (Default behavior di MongoDB)

**R16.3** **Esperimento**: Esegui `db.libri.find({ tags: { $in: ["classico", "fantasy"] } })`. Cosa fa `$in`? Quanti libri trova? Spiega la logica.

### Step 6.5: Query Avanzate e Aggregazioni

```javascript
// Trova libri con tag "classico" E disponibili
db.libri.find({ 
  $and: [
    { tags: "classico" },
    { disponibile: true }
  ]
})

// Regex: cerca "Signore" nel titolo (case-insensitive)
db.libri.find({ titolo: { $regex: /signore/i } })

// Aggregation: conta libri per genere
db.libri.aggregate([
  { $group: { _id: "$genere", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Aggregation: media anno pubblicazione
db.libri.aggregate([
  { $group: { _id: null, mediaAnno: { $avg: "$anno" } } }
])

// Aggregation: libri più vecchi per genere
db.libri.aggregate([
  { $sort: { anno: 1 } },
  { $group: { 
      _id: "$genere", 
      piuVecchio: { $first: "$titolo" },
      anno: { $first: "$anno" }
  }}
])
```

**📸 SCREENSHOT 18**: Output dell'aggregazione che conta libri per genere.

**❓ Domande di Riflessione 17**

**R17.1** L'aggregation pipeline è composta da **stages** (es: `$group`, `$sort`). Nell'esempio sopra, l'ordine degli stage è importante? Prova a invertire `$sort` e `$group` nell'ultimo esempio. Cosa cambia?

**R17.2** Esegui l'aggregazione per calcolare la media dell'anno. Quale risultato ottieni? Ha senso calcolare la "media dell'anno di pubblicazione"? In quale scenario reale potrebbe essere utile?

**R17.3** **Sfida avanzata**: Scrivi un'aggregazione che:
   1. Filtra solo libri disponibili
   2. Raggruppa per genere
   3. Calcola media copie per genere
   4. Ordina per media decrescente
   
   Documenta il codice e l'output.

### Step 6.6: Operazioni di Scrittura

```javascript
// Inserisci un nuovo libro
db.libri.insertOne({
  titolo: "Cent'anni di solitudine",
  autore: "Gabriel García Márquez",
  anno: 1967,
  genere: "Realismo magico",
  disponibile: true,
  copie: 3,
  tags: ["classico", "latinoamericano", "nobel"]
})

// Verifica inserimento
db.libri.countDocuments()

// Aggiorna un libro (aggiungi 2 copie)
db.libri.updateOne(
  { titolo: "1984" },
  { $inc: { copie: 2 } }
)

// Verifica aggiornamento
db.libri.findOne({ titolo: "1984" })

// Update con $set (cambia disponibilità)
db.libri.updateOne(
  { titolo: "Harry Potter e la pietra filosofale" },
  { $set: { disponibile: true, copie: 5 } }
)

// Aggiungi un tag a tutti i libri Fantasy
db.libri.updateMany(
  { genere: "Fantasy" },
  { $push: { tags: "immaginazione" } }
)

// Verifica
db.libri.find({ genere: "Fantasy" })
```

**📸 SCREENSHOT 19**: Inserimento di "Cent'anni di solitudine" con output che mostra `insertedId`.

**❓ Domande di Riflessione 18**

**R18.1** L'operatore `$inc` incrementa un valore numerico. Cosa succederebbe se lo usi su un campo che non esiste? Prova con `db.libri.updateOne({ titolo: "1984" }, { $inc: { prestiti: 1 } })` e osserva il risultato.

**R18.2** Differenza tra `updateOne()` e `updateMany()`: quando useresti uno o l'altro? Fai 2 esempi pratici per ciascuno nel contesto della biblioteca.

**R18.3** L'operatore `$push` aggiunge un elemento a un array. Cerca l'operatore `$addToSet`: quale differenza? Quale useresti per evitare duplicati nei tag?

### Step 6.7: Indici e Performance

```javascript
// Mostra gli indici esistenti
db.libri.getIndexes()

// Crea un indice composto (autore + anno)
db.libri.createIndex({ autore: 1, anno: -1 })
// 1 = ascending, -1 = descending

// Spiega una query (execution plan)
db.libri.find({ autore: "J.R.R. Tolkien" }).explain("executionStats")

// Conta documenti scansionati
```

**📸 SCREENSHOT 20**: Output di `db.libri.getIndexes()` mostrando tutti gli indici.

**❓ Domande di Riflessione 19**

**R19.1** Nell'output di `getIndexes()`, c'è sempre un indice su `_id`. Perché? Può essere eliminato? (Cerca "primary key MongoDB")

**R19.2** Esegui `.explain("executionStats")` su una query con filtro `{ genere: "Fantasy" }`. Osserva il campo `totalDocsExamined` vs `nReturned`. Cosa ti dice questo sull'efficienza della query?

**R19.3** Gli indici accelerano le letture ma rallentano le scritture. Perché? In uno scenario con 1 milione di libri e 1000 inserimenti/giorno, creeresti un indice su `genere`? Giustifica.

### Step 6.8: Uscita dalla Shell

```javascript
// Esci da mongosh
exit
```

**Oppure:** `Ctrl+D` (Linux/Mac) o `Ctrl+C` due volte (Windows)

---

---

## 🔬 Parte 7: Esperimenti e Analisi del Codice

### Step 7.1: Analisi dello Script di Inizializzazione

Apri e leggi il file:
```bash
cat volumes/init-mongo.js
```

**Analizza le sezioni:**

1. **Switch al database:** `db = db.getSiblingDB('biblioteca')`
2. **Creazione collezione:** `db.createCollection('libri')`
3. **Inserimento dati:** `db.libri.insertMany([...])`
4. **Creazione indici:** `db.libri.createIndex(...)`

**❓ Domande di Riflessione 20**

**R20.1** Lo script usa `insertMany()` invece di 5 `insertOne()`. Quali vantaggi offre? (Pensa a performance e atomicità)

**R20.2** Gli indici vengono creati DOPO l'inserimento dei dati. Sarebbe diverso crearli PRIMA? In un database con milioni di record, quale approccio preferiresti?

**R20.3** Lo script viene eseguito solo al primo avvio (directory `/docker-entrypoint-initdb.d/`). Come potresti modificare il docker-compose per eseguire uno script a ogni avvio?

### Step 7.2: Analisi del Backend Node.js

Apri e studia `volumes/app/server.js`.

**Architettura del file:**

```
Linee 1-20:   Import e configurazione
Linee 21-45:  Connessione MongoDB
Linee 46-80:  Endpoint GET (read)
Linee 81-120: Endpoint POST (create)
Linee 121-160: Endpoint PUT (update)
Linee 161-180: Endpoint DELETE
Linee 181-200: Error handling
Linee 201-222: Server startup
```

**Esercizi di code review:**

**Esercizio 1 - Error handling:**
```javascript
// Cerca questa sezione:
app.get('/api/libri', async (req, res) => {
  try {
    // ... codice ...
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

**Domande:**
- Il codice usa `try-catch`: perché è essenziale nelle operazioni async?
- Lo status code 500 cosa significa? Quando viene restituito?
- Cosa succederebbe senza il `try-catch`? Il server crasherebbe?

**Esercizio 2 - Validazione input:**
```javascript
// Cerca l'endpoint POST /api/libri
if (!titolo || !autore) {
  return res.status(400).json({ 
    success: false, 
    error: 'Titolo e autore sono obbligatori' 
  });
}
```

**Domande:**
- Quali campi vengono validati? Sono sufficienti?
- Aggiungi validazione per `anno` (deve essere numero tra 1000 e anno corrente)
- Status code 400 cosa significa? (Cerca "HTTP 400 Bad Request")

**📸 SCREENSHOT 21**: Porzione di codice `server.js` con la validazione dei campi, evidenziata.

**Esercizio 3 - MongoDB driver syntax:**
```javascript
// Confronta queste due sintassi:
const libri = await collection.find({}).toArray();
const libro = await collection.findOne({ _id: objectId });
```

**Domande:**
- Perché `find()` richiede `.toArray()` ma `findOne()` no?
- Cosa restituisce `find()` prima del `.toArray()`? (Cerca "cursor MongoDB")
- Come aggiungeresti paginazione? (Cerca `skip()` e `limit()`)

**❓ Domande di Riflessione 21**

**R21.1** Il server usa `express.static('public')` per servire file statici. Cosa succederebbe se sposti `index.html` da `public/` a `src/`? Prova e documenta.

**R21.2** Trova la riga `app.listen(3000, ...)`. Perché è hardcoded? Come cambieresti il codice per usare una variabile d'ambiente `PORT`? (Cerca `process.env.PORT`)

**R21.3** **Refactoring challenge**: Il file ha ~220 righe con tutti gli endpoint in un unico file. Come organizzeresti il codice usando il pattern MVC? Disegna la struttura di cartelle che proporresti.

### Step 7.3: Modifica e Test del Codice

**Esperimento 1 - Aggiungi un nuovo endpoint:**

Aggiungi questo codice a `server.js` (prima di `app.listen`):

```javascript
// Endpoint: autori con più libri
app.get('/api/autori/top', async (req, res) => {
  try {
    const autori = await collection.aggregate([
      { $group: { _id: "$autore", count: { $sum: 1 }, libri: { $push: "$titolo" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();
    
    res.json({ success: true, data: autori });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

**Test:**
```bash
# Il container si riavvia automaticamente (nodemon)
sleep 5
curl http://localhost:3000/api/autori/top | python3 -m json.tool
```

**📸 SCREENSHOT 22**: Output del nuovo endpoint `/api/autori/top`.

**❓ Domande di Riflessione 22**

**R22.1** Analizza l'aggregation pipeline aggiunta. Spiega cosa fa ogni stage (`$group`, `$sort`, `$limit`).

**R22.2** Il codice usa `$push: "$titolo"` per creare un array di libri. Cosa succederebbe se un autore ha 100 libri? Quale problema di performance potrebbe sorgere?

**Esperimento 2 - Implementa soft delete:**

Modifica l'endpoint DELETE:

```javascript
// Invece di deleteOne(), usa updateOne() con flag
app.delete('/api/libri/:id', async (req, res) => {
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { eliminato: true, data_eliminazione: new Date() } }
    );
    
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

**E modifica GET per escludere eliminati:**
```javascript
const libri = await collection.find({ eliminato: { $ne: true } }).toArray();
```

**📸 SCREENSHOT 23**: Documento "eliminato" visibile in Mongo Express con campo `eliminato: true`.

**❓ Domande di Riflessione 23**

**R23.1** Vantaggi del soft delete rispetto all'hard delete? Elenca almeno 3.

**R23.2** Svantaggi? (Pensa a privacy, GDPR, performance con milioni di record)

**R23.3** Come implementeresti un endpoint `/api/libri/cestino` che mostra solo i libri eliminati? Scrivi il codice.

### Step 7.4: Analisi del Frontend

Apri `volumes/app/public/index.html` e analizza:

**Pattern utilizzati:**

1. **Fetch API** per chiamate HTTP asincrone
2. **Template literals** per generare HTML dinamico
3. **Event listeners** per interattività
4. **Separation of concerns**: HTML/CSS/JS separati logicamente

**Esercizio:**

Aggiungi un pulsante "Elimina" su ogni card libro.

```javascript
// In displayBooks(), aggiungi nel template:
<button onclick="deleteBook('${libro._id}')">🗑️ Elimina</button>

// Aggiungi la funzione:
async function deleteBook(id) {
  if (!confirm('Sicuro di voler eliminare?')) return;
  
  try {
    const response = await fetch(`${API_URL}/libri/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
      loadBooks(); // Ricarica la lista
    }
  } catch (error) {
    showError('Errore eliminazione: ' + error.message);
  }
}
```

**📸 SCREENSHOT 24**: Frontend con pulsanti "Elimina" aggiunti su ogni card.

**❓ Domande di Riflessione 24**

**R24.1** Il codice usa `confirm()` per conferma. È user-friendly? Come miglioreresti l'UX? (Pensa a modal, undo, toast notifications)

**R24.2** Dopo la delete, il codice ricarica TUTTA la lista con `loadBooks()`. Approccio ottimale? Come lo ottimizzeresti? (Pensa a rimozione DOM element specifica)

### Step 7.5: Docker Deep Dive

**Analisi del Dockerfile:**

```bash
cat Dockerfile
```

**Analizza ogni istruzione:**

```dockerfile
FROM node:20-alpine          # Base image (perché alpine?)
WORKDIR /usr/src/app         # Directory di lavoro
COPY volumes/app/package*.json ./  # Copia solo package.json prima
RUN npm install              # Installa dipendenze (cacheable layer)
COPY volumes/app/ ./         # Copia tutto il resto
EXPOSE 3000                  # Documenta la porta (non la pubblica)
CMD ["npm", "run", "dev"]    # Comando di avvio
```

**❓ Domande di Riflessione 25**

**R25.1** Perché si copia `package.json` separatamente PRIMA di copiare tutto il codice? (Cerca "Docker layer caching")

**R25.2** L'immagine `node:20-alpine` è ~50MB, mentre `node:20` è ~900MB. Cosa è "Alpine Linux"? Quando NON useresti alpine?

**R25.3** La direttiva `EXPOSE 3000` non pubblica realmente la porta. A cosa serve? È obbligatoria?

**Analisi del docker-compose.yml:**

```bash
cat docker-compose.yml
```

**Sezioni chiave:**

1. **Version:** `3.8` (specifica la sintassi)
2. **Services:** definizione dei 3 container
3. **Networks:** creazione rete bridge
4. **Volumes:** mapping per persistenza
5. **Environment:** variabili da `.env`
6. **Healthcheck:** verifica stato MongoDB
7. **Depends_on:** gestione dipendenze

**📸 SCREENSHOT 25**: File `docker-compose.yml` completo visualizzato nel terminale o editor.

**❓ Domande di Riflessione 26**

**R26.1** La sezione `healthcheck` di MongoDB ha `interval: 10s` e `retries: 5`. Significa che aspetta max 50 secondi. È sufficiente? In produzione aumenteresti questi valori?

**R26.2** Il volume `./volumes/app` usa un **bind mount**. Alternativa: **named volume**. Quali differenze? Quando useresti uno o l'altro?

**R26.3** La rete è di tipo `bridge` (default). Esistono anche `host` e `overlay`. Cerca e spiega quando useresti `overlay` (hint: Docker Swarm).

### Esempio 1: Aggiungere un libro via API

```bash
curl -X POST http://localhost:3000/api/libri \
  -H "Content-Type: application/json" \
  -d '{
    "titolo": "Il Codice da Vinci",
    "autore": "Dan Brown",
    "anno": 2003,
    "genere": "Thriller",
    "disponibile": true,
    "copie": 2,
    "tags": ["mistero", "bestseller"]
  }'
```

Ricarica il frontend → vedrai il nuovo libro nella griglia!

### Esempio 2: Aggiornare un libro

Prima trova l'ID del libro:
```bash
curl http://localhost:3000/api/libri | python3 -m json.tool
# Copia l'_id del libro da aggiornare
```

Poi aggiorna:
```bash
curl -X PUT http://localhost:3000/api/libri/INSERISCI_ID_QUI \
  -H "Content-Type: application/json" \
  -d '{
    "disponibile": false,
    "copie": 0
  }'
```

### Esempio 3: Eliminare un libro

```bash
curl -X DELETE http://localhost:3000/api/libri/INSERISCI_ID_QUI
```

### Esempio 4: Query avanzate in mongosh

```bash
docker exec -it mongodb_server mongosh

use admin
db.auth('admin', 'password123')
use biblioteca

# Libri pubblicati dopo il 1950
db.libri.find({ anno: { $gt: 1950 } })

# Conta libri per genere
db.libri.aggregate([
  { $group: { _id: "$genere", count: { $sum: 1 } } }
])

# Libri con tag "classico"
db.libri.find({ tags: "classico" })

# Aggiorna copie di tutti i libri
db.libri.updateMany({}, { $inc: { copie: 1 } })
```

---

## 🛠️ Gestione Container

### Comandi utili

```bash
# Visualizza stato container
docker compose ps

# Logs in tempo reale
docker compose logs -f

# Logs di un servizio specifico
docker compose logs -f nodejs-app
docker compose logs -f mongodb

# Riavvia un servizio
docker compose restart nodejs-app

# Ferma tutti i servizi (dati persistono)
docker compose stop

# Ferma e rimuovi container (dati persistono)
docker compose down

# Riavvia tutto da zero
docker compose down
docker compose up -d

# Entra nel container Node.js
docker exec -it nodejs_app sh

# Entra nel container MongoDB
docker exec -it mongodb_server bash

# Ricostruisci immagine Node.js (dopo modifiche a Dockerfile)
docker compose build nodejs-app
docker compose up -d nodejs-app
```

### Modificare il codice

I file in `volumes/app/` sono montati come volume, quindi:

1. **Modifica `server.js` o `index.html`**
2. Salva il file
3. Il container Node.js si riavvia automaticamente (grazie a nodemon)
4. Ricarica il browser

**Nota:** se modifichi `package.json`, devi riavviare manualmente:
```bash
docker compose restart nodejs-app
```

---

## 🔧 Troubleshooting

### Problema: Container mongodb_server si riavvia continuamente

**Diagnosi:**
```bash
docker compose logs mongodb
```

**Causa comune:** Dati corrotti in `volumes/mongo-data/`

**Soluzione:**
```bash
docker compose down
sudo rm -rf volumes/mongo-data/*
docker compose up -d
```

### Problema: nodejs_app esce immediatamente

**Diagnosi:**
```bash
docker compose logs nodejs-app
```

**Cause comuni:**
- MongoDB non ancora pronto → attendi 40s
- Errore sintassi in `server.js` → controlla i log
- Dipendenze mancanti → `docker compose build nodejs-app`

**Soluzione:**
```bash
docker compose down
docker compose up -d
docker compose logs -f nodejs-app
```

### Problema: Porta già in uso

**Errore:** `Error: port is already allocated`

**Soluzione:** cambia porte in `docker-compose.yml`

```yaml
ports:
  - "3001:3000"  # invece di 3000:3000
```

### Problema: Mongo Express non si connette

**Verifica credenziali in `.env`:**
```bash
cat .env
```

**Ricrea container:**
```bash
docker compose down
docker compose up -d mongo-express
```

### Problema: Non vedo i libri nel frontend

**Verifica API:**
```bash
curl http://localhost:3000/api/libri
```

Se ritorna errore:
```bash
docker compose logs nodejs-app
```

**Verifica MongoDB:**
```bash
docker exec -it mongodb_server mongosh
use admin
db.auth('admin', 'password123')
use biblioteca
db.libri.countDocuments()
```

Se `countDocuments()` ritorna 0:
```bash
docker compose down
sudo rm -rf volumes/mongo-data/*
docker compose up -d
```

---

## ✅ Checklist di Test Completa

- [ ] Container avviati: `docker compose ps` mostra 3 container "Up"
- [ ] Frontend accessibile: http://localhost:3000 mostra la biblioteca
- [ ] API funziona: `curl http://localhost:3000/api/health` ritorna `{"status":"ok"}`
- [ ] Libri visibili: Frontend mostra 5 libri iniziali
- [ ] Ricerca funziona: Cerca "Tolkien" → mostra "Il Signore degli Anelli"
- [ ] Statistiche corrette: 5 totali, 4 disponibili, 1 in prestito
- [ ] Mongo Express: http://localhost:8081 accessibile con credenziali
- [ ] Database `biblioteca` visibile in Mongo Express
- [ ] Collezione `libri` contiene 5 documenti
- [ ] Creazione libro: `curl -X POST...` aggiunge libro
- [ ] Aggiornamento: `curl -X PUT...` modifica libro
- [ ] Eliminazione: `curl -X DELETE...` rimuove libro
- [ ] MongoDB Shell: `docker exec -it mongodb_server mongosh` funziona

---

## 📸 Screenshot da consegnare

1. **Terminale:** Output di `docker compose ps` (3 container Up)
2. **Browser:** Frontend su http://localhost:3000 con griglia libri
3. **Browser:** Statistiche aggiornate (card in alto)
4. **Terminale:** Output di `curl http://localhost:3000/api/libri` (JSON libri)
5. **Mongo Express:** Collezione `libri` con documenti visibili
6. **Terminale:** Creazione nuovo libro via `curl -X POST`
7. **Browser:** Nuovo libro visibile nel frontend dopo ricarica
8. **MongoDB Shell:** Output di `db.libri.find()` in mongosh

---

## 🎯 Prossimi Passi

### Esercizi suggeriti

1. **Aggiungi campo categoria**: modifica schema per includere sottocategorie
2. **Implementa prestiti**: aggiungi API per prestare/restituire libri
3. **Aggiungi autenticazione**: proteggi le API con JWT
4. **Crea frontend reattivo**: usa React o Vue.js
5. **Aggiungi paginazione**: limita risultati API a 10 per pagina
6. **Implementa upload immagini**: copertine dei libri
7. **Aggiungi validazione**: verifica dati prima dell'inserimento
8. **Crea backup automatici**: script per export dati

### Approfondimenti

- Studia aggregation pipeline: `db.libri.aggregate([...])`
- Crea indici composti: `db.libri.createIndex({ autore: 1, anno: -1 })`
- Implementa full-text search: `db.libri.createIndex({ titolo: "text" })`
- Usa transazioni: operazioni atomiche multi-documento

---

## 📚 Risorse

- **MongoDB Docs**: https://www.mongodb.com/docs/
- **Node.js MongoDB Driver**: https://www.mongodb.com/docs/drivers/node/
- **Express.js**: https://expressjs.com/
- **Mongo Express**: https://github.com/mongo-express/mongo-express
- **Docker Compose**: https://docs.docker.com/compose/

---

## 📄 Licenza

Materiale didattico - Corso MongoDB

---

## 🎯 Parte 8: Sfide Avanzate (Opzionali)

### Sfida 1: Sistema di Prestiti

Implementa un sistema completo di prestiti:

**Requisiti:**
1. Endpoint `POST /api/libri/:id/prestito` che:
   - Decrementa `copie`
   - Se `copie === 0`, imposta `disponibile: false`
   - Registra prestito in collezione separata `prestiti` con: `{ libro_id, utente, data_prestito, data_restituzione_prevista }`

2. Endpoint `POST /api/libri/:id/restituzione` che:
   - Incrementa `copie`
   - Imposta `disponibile: true`
   - Aggiorna il prestito con `data_restituzione_effettiva`

3. Endpoint `GET /api/prestiti/attivi` che mostra prestiti non restituiti

**📸 SCREENSHOT 26**: Implementazione funzionante con test via curl.

### Sfida 2: Autenticazione JWT

Aggiungi autenticazione con JWT (JSON Web Tokens):

**Requisiti:**
1. Collezione `utenti` con username/password hashati (bcrypt)
2. Endpoint `POST /api/auth/register` e `/api/auth/login`
3. Middleware che protegge endpoint POST/PUT/DELETE (solo utenti autenticati possono modificare)
4. Frontend con form di login

**Librerie:** `jsonwebtoken`, `bcrypt`

**📸 SCREENSHOT 27**: Login funzionante e chiamata API protetta con token.

### Sfida 3: Ricerca Full-Text

Implementa ricerca full-text con MongoDB:

```javascript
// Crea indice full-text
db.libri.createIndex({ titolo: "text", autore: "text" })

// Query full-text
db.libri.find({ $text: { $search: "tolkien anelli" } })
```

**Requisiti:**
1. Indice text su titolo e autore
2. Endpoint `GET /api/search?q=query`
3. Supporto per ricerca multi-parola
4. Ordinamento per rilevanza (`$meta: "textScore"`)

**📸 SCREENSHOT 28**: Ricerca full-text con score di rilevanza.

### Sfida 4: Statistiche Avanzate con Aggregations

Dashboard con grafici usando Chart.js:

**Metriche:**
1. Libri per decade (1940-1949, 1950-1959, etc.)
2. Top 10 autori per numero libri
3. Generi più popolari (torta)
4. Trend copie disponibili nel tempo

**📸 SCREENSHOT 29**: Dashboard con grafici visualizzati.

### Sfida 5: Esportazione Dati

Endpoint per esportare la collezione:

**Formati:**
1. **CSV**: `/api/export/csv` → file CSV scaricabile
2. **JSON**: `/api/export/json` → backup completo
3. **PDF**: `/api/export/pdf/:id` → scheda libro singolo

**Librerie:** `json2csv`, `pdfkit`

**📸 SCREENSHOT 30**: File CSV scaricato e aperto in Excel.

### Sfida 6: Monitoraggio e Logging

Implementa logging professionale:

**Requisiti:**
1. Logger con Winston (livelli: error, warn, info, debug)
2. Log su file rotanti (max 10MB, 5 file)
3. Middleware che logga ogni richiesta HTTP
4. Error tracking (es: Sentry)

```javascript
const winston = require('winston');
const logger = winston.createLogger({...});
logger.info('Server avviato', { port: 3000 });
```

**📸 SCREENSHOT 31**: File di log con richieste tracciate.

### Sfida 7: Testing Automatizzato

Scrivi test con Jest e Supertest:

**Test da implementare:**
1. GET `/api/libri` ritorna array
2. POST `/api/libri` con dati validi crea libro
3. POST `/api/libri` senza titolo ritorna 400
4. DELETE con ID inesistente ritorna errore
5. Ricerca con query vuota ritorna tutti

```javascript
describe('API Libri', () => {
  test('GET /api/libri ritorna array', async () => {
    const res = await request(app).get('/api/libri');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
```

**📸 SCREENSHOT 32**: Output di Jest con tutti i test passing.

### Sfida 8: Containerizzazione Avanzata

Ottimizza il setup Docker:

**Miglioramenti:**
1. Multi-stage build per produzione (separare dev/prod)
2. Docker secrets per password (invece di .env)
3. Healthcheck custom per Node.js
4. Resource limits (CPU, memoria)
5. Non-root user nel container

```dockerfile
# Multi-stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
USER node
COPY --from=builder /app/node_modules ./node_modules
...
```

**📸 SCREENSHOT 33**: `docker compose ps` con resource limits visibili.

---

## 📊 Parte 9: Documentazione Finale e Consegna

### Template Documento Google

Crea un documento strutturato così:

```
═══════════════════════════════════════════════
    LABORATORIO MONGODB + NODE.JS + EXPRESS
═══════════════════════════════════════════════

Studente: [Nome Cognome]
Classe: [Classe]
Data: [GG/MM/AAAA]

═══════════════════════════════════════════════

INDICE

1. Introduzione
2. Architettura del Sistema
3. Setup Ambiente
4. Test Frontend
5. Test API REST
6. Mongo Express
7. MongoDB Shell
8. Analisi Codice
9. Esperimenti Avanzati
10. Conclusioni

═══════════════════════════════════════════════

1. INTRODUZIONE

[Breve descrizione del progetto e obiettivi]

═══════════════════════════════════════════════

2. ARCHITETTURA DEL SISTEMA

2.1 Diagramma Architettura
[SCREENSHOT 1: Diagramma disegnato]

2.2 Risposte Domande di Riflessione 1

R1.1 Vantaggi separazione in container:
[Risposta...]

R1.2 Persistenza dati:
[Risposta...]

R1.3 Sicurezza porta MongoDB:
[Risposta...]

R1.4 Flusso richiesta HTTP:
[SCREENSHOT 2: Schema flusso]

═══════════════════════════════════════════════

3. SETUP AMBIENTE

3.1 File di Configurazione
[SCREENSHOT 3: File .env]

Risposte Domande di Riflessione 2:
R2.1 [...]
R2.2 [...]
R2.3 [...]

3.2 Avvio Container
[SCREENSHOT 4: docker compose up]
[SCREENSHOT 5: docker compose ps]

Risposte Domande di Riflessione 3:
R3.1 [...]
R3.2 [...]
R3.3 [...]

═══════════════════════════════════════════════

[...continua con tutte le sezioni...]

═══════════════════════════════════════════════

10. CONCLUSIONI

10.1 Cosa ho imparato

[Descrivi almeno 5 concetti chiave che hai appreso]

1. [...]
2. [...]
3. [...]
4. [...]
5. [...]

10.2 Difficoltà Incontrate

[Descrivi problemi e come li hai risolti]

10.3 Miglioramenti Futuri

[Cosa aggiungeresti? Quali funzionalità implementeresti?]

10.4 Riflessione Personale

[Commento libero sull'esperienza, min 200 parole]

═══════════════════════════════════════════════
```

### Checklist di Controllo

Prima di consegnare, verifica:

**Screenshot (minimo 30):**
- [ ] Tutti gli screenshot richiesti sono presenti
- [ ] Risoluzione leggibile (≥ 1280px larghezza)
- [ ] Elementi importanti evidenziati con cerchi/frecce
- [ ] Didascalie esplicative sotto ogni screenshot

**Risposte alle Domande (26 domande totali):**
- [ ] R1.1 - R1.4 (Architettura)
- [ ] R2.1 - R2.3 (Configurazione)
- [ ] R3.1 - R3.3 (Setup)
- [ ] R4.1 - R4.3 (Frontend)
- [ ] R5.1 - R5.3 (Ricerca)
- [ ] R6.1 - R6.3 (Codice Frontend)
- [ ] R7.1 - R7.2 (Health Check)
- [ ] R8.1 - R8.3 (API REST)
- [ ] R9.1 - R9.3 (POST)
- [ ] R10.1 - R10.2 (PUT)
- [ ] R11.1 - R11.2 (DELETE)
- [ ] R12.1 - R12.2 (Mongo Express)
- [ ] R13.1 - R13.3 (Query GUI)
- [ ] R14.1 - R14.2 (Creazione documenti)
- [ ] R15.1 - R15.2 (MongoDB Shell)
- [ ] R16.1 - R16.3 (Query CLI)
- [ ] R17.1 - R17.3 (Aggregations)
- [ ] R18.1 - R18.3 (Operazioni scrittura)
- [ ] R19.1 - R19.3 (Indici)
- [ ] R20.1 - R20.3 (Script init)
- [ ] R21.1 - R21.3 (Backend)
- [ ] R22.1 - R22.2 (Nuovo endpoint)
- [ ] R23.1 - R23.3 (Soft delete)
- [ ] R24.1 - R24.2 (Frontend modifica)
- [ ] R25.1 - R25.3 (Dockerfile)
- [ ] R26.1 - R26.3 (Docker Compose)

**Esperimenti:**
- [ ] Almeno 3 esperimenti documentati
- [ ] Modifiche al codice testate e funzionanti
- [ ] Screenshot dei risultati

**Sezione Conclusioni:**
- [ ] Minimo 5 concetti chiave appresi
- [ ] Difficoltà documentate con soluzioni
- [ ] Riflessione personale (≥ 200 parole)
- [ ] Miglioramenti futuri proposti

**Formattazione:**
- [ ] Indice cliccabile (link alle sezioni)
- [ ] Titoli gerarchici (H1, H2, H3)
- [ ] Codice formattato con font monospace
- [ ] Colori usati per evidenziare concetti importanti

### Criteri di Valutazione

Il lavoro verrà valutato su:

| Criterio | Peso | Descrizione |
|----------|------|-------------|
| **Completezza** | 25% | Tutti gli screenshot e risposte presenti |
| **Correttezza** | 25% | Risposte tecnicamente accurate |
| **Approfondimento** | 20% | Capacità di andare oltre il richiesto |
| **Chiarezza** | 15% | Esposizione chiara e ben organizzata |
| **Sperimentazione** | 10% | Esperimenti creativi e funzionanti |
| **Riflessione critica** | 5% | Capacità di analisi e autovalutazione |

**Punteggi:**
- **< 60%**: Insufficiente - Rifare parti mancanti
- **60-70%**: Sufficiente - Minimo richiesto soddisfatto
- **70-80%**: Buono - Lavoro completo e corretto
- **80-90%**: Ottimo - Approfondimenti significativi
- **90-100%**: Eccellente - Creatività e padronanza eccezionali

### Consegna

**Modalità:**
1. Crea documento Google Drive
2. Imposta permessi: "Chiunque con il link può visualizzare"
3. Copia link condivisibile
4. Invia link via [piattaforma specificata dal docente]

**Deadline:** [Specificare deadline]

**Formato nome file:** 
`MongoDB_Lab_[CognomeNome]_[Classe]_[Data].pdf` (esporta anche in PDF come backup)

---

## 🔗 Risorse Aggiuntive

### Documentazione Ufficiale

- **MongoDB Manual:** https://www.mongodb.com/docs/manual/
- **MongoDB Node.js Driver:** https://www.mongodb.com/docs/drivers/node/current/
- **Express.js Guide:** https://expressjs.com/en/guide/routing.html
- **Docker Compose:** https://docs.docker.com/compose/
- **Mongo Express:** https://github.com/mongo-express/mongo-express

### Tutorial e Corsi

- **MongoDB University:** https://university.mongodb.com/ (corsi gratuiti)
- **Docker Tutorial:** https://www.docker.com/101-tutorial/
- **REST API Best Practices:** https://restfulapi.net/

### Tools Utili

- **MongoDB Compass:** GUI desktop alternativa a Mongo Express
- **Postman:** Testing API REST (alternativa a curl)
- **Studio 3T:** Client MongoDB avanzato
- **MongoSH Playground:** Test query in VSCode

### Approfondimenti Tematici

**MongoDB:**
- Indexing strategies
- Aggregation pipeline optimization
- Replication e sharding
- Schema design patterns
- Transactions in MongoDB

**Node.js:**
- Async/await vs Promises
- Error handling best practices
- Middleware pattern in Express
- Environment variables management
- Production deployment (PM2, clustering)

**Docker:**
- Multi-stage builds
- Docker secrets
- Docker networks deep dive
- Volume drivers
- Container orchestration (Kubernetes intro)

**Architetture:**
- Microservices pattern
- API Gateway
- Event-driven architecture
- CQRS (Command Query Responsibility Segregation)

---

## 🆘 Supporto e Domande

**Durante l'esercitazione:**

1. **Problemi tecnici:** Consulta la sezione Troubleshooting
2. **Errori di codice:** Usa `docker compose logs [servizio]`
3. **Domande concettuali:** Rileggi le sezioni teoriche
4. **Dubbi sulle domande:** Cerca online e documenta la ricerca

**Dopo l'esercitazione:**

- Forum della classe: [Link se disponibile]
- Email docente: [Email docente]
- Orari ricevimento: [Specificare]

**Risorse community:**

- Stack Overflow (tag: mongodb, node.js, docker)
- MongoDB Community Forums
- Discord/Slack classe (se disponibile)

---

## 📜 Licenza e Note Finali

**Materiale didattico** - Corso MongoDB  
**Versione:** 1.0  
**Ultima modifica:** Maggio 2026

**Nota importante:**

Questo laboratorio è progettato per **apprendere facendo**. Non limitarti a seguire meccanicamente le istruzioni: 

- **Sperimenta:** Cambia parametri, prova varianti, rompi cose (e riparale!)
- **Rifletti:** Ogni domanda ha lo scopo di farti pensare, non è un test nozionistico
- **Documenta:** Screenshots e risposte sono il tuo "diario di apprendimento"
- **Collabora:** Discuti con i compagni, ma consegna lavoro individuale
- **Approfondisci:** Le sfide opzionali sono dove impari davvero

> *"I hear and I forget. I see and I remember. I do and I understand."* — Confucio

**Buon lavoro! 🚀**

---

**Fine del laboratorio**
