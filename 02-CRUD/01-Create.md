# Capitolo 4 — Create: Inserire documenti

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Inserire singoli documenti con `insertOne()`
- Inserire più documenti con `insertMany()`
- Comprendere la struttura BSON di un documento
- Gestire il campo `_id` e ObjectId
- Creare documenti con strutture complesse (array, documenti annidati)
- Gestire gli errori di inserimento

---

## 1. Inserire un singolo documento: `insertOne()`

### 1.1 Sintassi base

```javascript
db.collezione.insertOne(documento)
```

**Esempio:**

```javascript
db.prodotti.insertOne({
  nome: "Laptop Dell XPS 15",
  prezzo: 1299.99,
  categoria: "Elettronica",
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

**Spiegazione:**
- `acknowledged`: conferma che l'operazione è stata eseguita
- `insertedId`: l'`_id` del documento inserito

### 1.2 Verifica dell'inserimento

```javascript
db.prodotti.find()
```

Output:

```json
{
  "_id": ObjectId("6641f2a3b4c5d6e7f8a9b0c1"),
  "nome": "Laptop Dell XPS 15",
  "prezzo": 1299.99,
  "categoria": "Elettronica",
  "disponibile": true
}
```

---

## 2. Inserire più documenti: `insertMany()`

### 2.1 Sintassi base

```javascript
db.collezione.insertMany([documento1, documento2, ...])
```

**Esempio:**

```javascript
db.prodotti.insertMany([
  {
    nome: "iPhone 14 Pro",
    prezzo: 1199.00,
    categoria: "Smartphone",
    disponibile: true,
    specifiche: {
      memoria: "256GB",
      colore: "Space Black"
    }
  },
  {
    nome: "Samsung Galaxy S23",
    prezzo: 899.00,
    categoria: "Smartphone",
    disponibile: true,
    specifiche: {
      memoria: "128GB",
      colore: "Phantom Black"
    }
  },
  {
    nome: "iPad Air",
    prezzo: 699.00,
    categoria: "Tablet",
    disponibile: false
  }
])
```

**Output:**

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

### 2.2 Opzione `ordered`

Di default, `insertMany()` inserisce i documenti in ordine e si ferma al primo errore.

```javascript
// Inserimento ordinato (default)
db.prodotti.insertMany([
  { nome: "Prodotto A", prezzo: 10 },
  { nome: "Prodotto B", prezzo: 20 },
  { nome: "Prodotto C", prezzo: 30 }
], { ordered: true })

// Inserimento non ordinato (continua anche in caso di errore)
db.prodotti.insertMany([
  { nome: "Prodotto D", prezzo: 40 },
  { nome: "Prodotto E", prezzo: 50 },
  { nome: "Prodotto F", prezzo: 60 }
], { ordered: false })
```

---

## 3. Il campo `_id`

### 3.1 `_id` automatico

Se non specifichi `_id`, MongoDB genera automaticamente un **ObjectId**:

```javascript
db.utenti.insertOne({
  nome: "Mario",
  cognome: "Rossi"
})

// MongoDB aggiunge automaticamente:
// "_id": ObjectId("6641f2a3b4c5d6e7f8a9b0c1")
```

### 3.2 `_id` personalizzato

Puoi specificare un `_id` personalizzato:

```javascript
db.utenti.insertOne({
  _id: "user_001",
  nome: "Laura",
  cognome: "Bianchi"
})

db.utenti.insertOne({
  _id: 12345,
  nome: "Giovanni",
  cognome: "Verdi"
})

db.utenti.insertOne({
  _id: { tipo: "cliente", numero: 1001 },
  nome: "Anna",
  cognome: "Neri"
})
```

**Vincoli:**
- `_id` deve essere univoco nella collezione
- Non può essere modificato dopo l'inserimento
- Non può essere `null` o mancante (se non lo specifichi, viene generato)

### 3.3 Errore di `_id` duplicato

```javascript
db.utenti.insertOne({
  _id: "user_001",
  nome: "Paolo",
  cognome: "Blu"
})
```

**Errore:**

```
MongoServerError: E11000 duplicate key error collection: test.utenti index: _id_ dup key: { _id: "user_001" }
```

---

## 4. ObjectId

### 4.1 Struttura di ObjectId

Un **ObjectId** è un identificatore univoco di 12 byte:

```
ObjectId("6641f2a3b4c5d6e7f8a9b0c1")
```

**Composizione:**
- **4 byte**: timestamp Unix (secondi dal 1970)
- **5 byte**: valore random
- **3 byte**: contatore incrementale

### 4.2 Proprietà di ObjectId

```javascript
// Creare un nuovo ObjectId
const id = ObjectId()

// Ottenere il timestamp
id.getTimestamp()
// Output: 2026-05-04T15:30:00.000Z

// Convertire in stringa
id.toString()
// Output: "6641f2a3b4c5d6e7f8a9b0c1"
```

### 4.3 Vantaggi di ObjectId

✅ **Univoco globalmente**: anche tra server diversi  
✅ **Ordinabile cronologicamente**: contiene timestamp  
✅ **Non richiede autoincremento centralizzato**  
✅ **Generato lato client**: non sovraccarica il server

---

## 5. Tipi di dati BSON

MongoDB usa **BSON** (Binary JSON) che supporta più tipi di dati rispetto a JSON standard.

### 5.1 Tipi di dati comuni

| Tipo BSON | JavaScript | Esempio |
|-----------|-----------|---------|
| String | String | `"Ciao mondo"` |
| Number (Int32) | Number | `42` |
| Number (Int64) | Number/Long | `NumberLong("9223372036854775807")` |
| Double | Number | `3.14159` |
| Boolean | Boolean | `true`, `false` |
| Date | Date | `new Date()`, `ISODate("2026-05-04")` |
| ObjectId | ObjectId | `ObjectId()` |
| Array | Array | `[1, 2, 3]` |
| Object | Object | `{ nome: "Mario" }` |
| Null | null | `null` |
| Binary | BinData | `BinData(0, "base64string")` |
| Decimal128 | Decimal128 | `NumberDecimal("19.99")` |

### 5.2 Esempio con vari tipi

```javascript
db.prodotti.insertOne({
  nome: "Smartwatch",
  prezzo: NumberDecimal("199.99"),  // Decimal preciso per prezzi
  quantita: NumberInt(50),           // Intero a 32 bit
  vendite_totali: NumberLong(1000000), // Intero a 64 bit
  disponibile: true,
  data_inserimento: new Date(),
  immagine: BinData(0, "iVBORw0KGgoAAAANSUhEUgAAAAUA..."),
  note: null
})
```

---

## 6. Documenti annidati (Embedded Documents)

### 6.1 Oggetti annidati

```javascript
db.utenti.insertOne({
  nome: "Mario",
  cognome: "Rossi",
  indirizzo: {
    via: "Via Roma 10",
    citta: "Milano",
    cap: "20100",
    provincia: "MI"
  },
  contatti: {
    email: "mario.rossi@example.com",
    telefono: "+39 02 1234567"
  }
})
```

### 6.2 Livelli multipli di annidamento

```javascript
db.aziende.insertOne({
  nome: "TechCorp",
  sede: {
    indirizzo: {
      via: "Via Garibaldi 5",
      citta: "Roma",
      cap: "00100"
    },
    coordinate: {
      latitudine: 41.9028,
      longitudine: 12.4964
    }
  },
  ceo: {
    nome: "Laura Bianchi",
    contatti: {
      email: "laura@techcorp.com",
      linkedin: "linkedin.com/in/laurabianchi"
    }
  }
})
```

---

## 7. Array

### 7.1 Array di valori semplici

```javascript
db.studenti.insertOne({
  nome: "Anna",
  cognome: "Verdi",
  corsi: ["Matematica", "Fisica", "Informatica"],
  voti: [28, 30, 27, 29],
  hobby: ["lettura", "sport", "musica"]
})
```

### 7.2 Array di oggetti

```javascript
db.ordini.insertOne({
  numero_ordine: "ORD-2026-001",
  cliente: "Mario Rossi",
  data: new Date(),
  prodotti: [
    {
      nome: "Laptop",
      quantita: 1,
      prezzo: 1299.99
    },
    {
      nome: "Mouse wireless",
      quantita: 2,
      prezzo: 29.99
    },
    {
      nome: "Tastiera meccanica",
      quantita: 1,
      prezzo: 149.99
    }
  ],
  totale: 1509.96
})
```

### 7.3 Array annidati

```javascript
db.ricette.insertOne({
  nome: "Lasagne alla bolognese",
  difficolta: "Media",
  ingredienti: [
    ["sfoglia", "500g"],
    ["carne macinata", "400g"],
    ["passata di pomodoro", "500ml"]
  ],
  tags: [["italiano", "pasta"], ["forno", "gratinato"]]
})
```

---

## 8. Documenti complessi: esempio pratico

### 8.1 Sistema di e-commerce

```javascript
db.prodotti_ecommerce.insertOne({
  _id: "PROD-2026-001",
  nome: "MacBook Pro 16\"",
  marca: "Apple",
  categoria: "Laptop",
  prezzo: NumberDecimal("2499.00"),
  sconto_percentuale: 10,
  prezzo_scontato: NumberDecimal("2249.10"),
  disponibile: true,
  quantita_magazzino: 15,
  
  specifiche: {
    processore: "Apple M2 Max",
    ram: "32GB",
    storage: "1TB SSD",
    schermo: "16 pollici Retina",
    peso: "2.15 kg"
  },
  
  dimensioni: {
    lunghezza: 35.57,
    larghezza: 24.81,
    altezza: 1.68,
    unita: "cm"
  },
  
  immagini: [
    "https://cdn.example.com/img1.jpg",
    "https://cdn.example.com/img2.jpg",
    "https://cdn.example.com/img3.jpg"
  ],
  
  recensioni: [
    {
      utente: "Giovanni",
      voto: 5,
      titolo: "Eccellente!",
      commento: "Prestazioni incredibili",
      data: ISODate("2026-04-15")
    },
    {
      utente: "Laura",
      voto: 4,
      titolo: "Ottimo ma costoso",
      commento: "Prodotto di qualità ma prezzo elevato",
      data: ISODate("2026-04-20")
    }
  ],
  
  valutazione_media: 4.5,
  numero_recensioni: 2,
  
  spedizione: {
    gratuita: true,
    tempi_consegna: "2-3 giorni",
    corrieri: ["DHL", "UPS", "GLS"]
  },
  
  tags: ["apple", "laptop", "professionale", "2026"],
  
  meta: {
    data_inserimento: new Date(),
    data_ultima_modifica: new Date(),
    inserito_da: "admin",
    visibile_sito: true
  }
})
```

---

## 9. Validazione dei dati

### 9.1 Validazione lato applicazione

MongoDB non impone uno schema rigido, ma è buona pratica validare i dati prima dell'inserimento:

```javascript
// Esempio di validazione manuale
function inserisciProdotto(prodotto) {
  // Validazione
  if (!prodotto.nome || typeof prodotto.nome !== 'string') {
    throw new Error("Nome prodotto obbligatorio");
  }
  
  if (!prodotto.prezzo || prodotto.prezzo <= 0) {
    throw new Error("Prezzo deve essere maggiore di zero");
  }
  
  // Inserimento
  return db.prodotti.insertOne(prodotto);
}
```

### 9.2 Schema Validation (opzionale)

Puoi definire regole di validazione a livello di collezione:

```javascript
db.createCollection("clienti", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nome", "email"],
      properties: {
        nome: {
          bsonType: "string",
          description: "Nome obbligatorio (stringa)"
        },
        email: {
          bsonType: "string",
          pattern: "^.+@.+\..+$",
          description: "Email obbligatoria (formato valido)"
        },
        eta: {
          bsonType: "int",
          minimum: 18,
          maximum: 120,
          description: "Età tra 18 e 120"
        }
      }
    }
  }
})
```

**Tentativo di inserimento non valido:**

```javascript
db.clienti.insertOne({
  nome: "Mario",
  email: "email-non-valida"
})
```

**Errore:**

```
MongoServerError: Document failed validation
```

---

## 10. Gestione degli errori

### 10.1 Errore di campo duplicato

```javascript
// Crea indice univoco su email
db.utenti.createIndex({ email: 1 }, { unique: true })

// Primo inserimento: OK
db.utenti.insertOne({ nome: "Mario", email: "mario@example.com" })

// Secondo inserimento: ERRORE
db.utenti.insertOne({ nome: "Laura", email: "mario@example.com" })
```

**Errore:**

```
MongoServerError: E11000 duplicate key error collection: test.utenti index: email_1 dup key: { email: "mario@example.com" }
```

### 10.2 Gestione degli errori con try-catch

```javascript
try {
  db.utenti.insertOne({
    _id: "user_001",
    nome: "Mario"
  });
  print("Inserimento riuscito!");
} catch (error) {
  print("Errore: " + error.message);
}
```

### 10.3 `insertMany()` con errori parziali

```javascript
try {
  db.prodotti.insertMany([
    { _id: 1, nome: "Prodotto A" },
    { _id: 2, nome: "Prodotto B" },
    { _id: 1, nome: "Prodotto C" },  // Errore: _id duplicato
    { _id: 3, nome: "Prodotto D" }
  ], { ordered: false });  // Continua anche con errori
} catch (error) {
  printjson(error);
}
```

**Comportamento:**
- Con `ordered: true` (default): si ferma al primo errore
- Con `ordered: false`: tenta di inserire tutti i documenti, riporta gli errori alla fine

---

## 11. Best practices

### 11.1 Progettazione dei documenti

✅ **Embedding vs Referencing**: usa documenti annidati per dati strettamente correlati  
✅ **Limita la dimensione dei documenti**: max 16 MB per documento  
✅ **Evita array enormi**: limitali a centinaia di elementi, non migliaia  
✅ **Denormalizza con criterio**: duplica i dati se migliorano le performance

### 11.2 Inserimenti

✅ **Usa `insertMany()` per batch**: più efficiente di tanti `insertOne()`  
✅ **Gestisci gli errori**: sempre con try-catch nelle applicazioni  
✅ **Valida i dati**: prima dell'inserimento  
✅ **Usa tipi appropriati**: `NumberDecimal` per prezzi, `ISODate` per date  
✅ **Specifica `_id` solo se necessario**: lascia generare ObjectId a MongoDB

### 11.3 Performance

✅ **Batch di massimo 1000 documenti**: per `insertMany()`  
✅ **Usa `ordered: false`**: se l'ordine non è importante (più veloce)  
✅ **Crea indici prima di inserimenti massivi**: evita di crearli dopo

---

## 12. Esempi pratici

### 12.1 Blog

```javascript
db.articoli.insertOne({
  titolo: "Introduzione a MongoDB",
  slug: "introduzione-a-mongodb",
  autore: {
    nome: "Mario Rossi",
    email: "mario@blog.com",
    biografia: "Sviluppatore full-stack"
  },
  contenuto: "MongoDB è un database NoSQL...",
  data_pubblicazione: new Date("2026-05-04"),
  categoria: "Database",
  tags: ["mongodb", "nosql", "database", "tutorial"],
  immagine_copertina: "https://cdn.blog.com/mongodb-intro.jpg",
  pubblicato: true,
  commenti: [],
  visualizzazioni: 0,
  likes: 0
})
```

### 12.2 Social Network

```javascript
db.post.insertOne({
  autore_id: ObjectId("6641f2a3b4c5d6e7f8a9b0c1"),
  testo: "Che bella giornata! ☀️",
  immagini: [
    "https://cdn.social.com/img123.jpg"
  ],
  data_creazione: new Date(),
  mi_piace: [],
  commenti: [
    {
      utente_id: ObjectId("6641f2a3b4c5d6e7f8a9b0c2"),
      testo: "Concordo!",
      data: new Date()
    }
  ],
  condivisioni: 0,
  visibilita: "pubblico",
  posizione: {
    citta: "Milano",
    paese: "Italia",
    coordinate: {
      type: "Point",
      coordinates: [9.1900, 45.4642]
    }
  }
})
```

### 12.3 Sistema di prenotazioni

```javascript
db.prenotazioni.insertOne({
  numero_prenotazione: "BOOK-2026-05-04-001",
  cliente: {
    nome: "Laura Bianchi",
    email: "laura@example.com",
    telefono: "+39 333 1234567"
  },
  hotel: {
    nome: "Grand Hotel Milano",
    indirizzo: "Via Manzoni 29, Milano",
    stelle: 5
  },
  camera: {
    tipo: "Suite",
    numero: 305,
    letti: 2,
    vista: "città"
  },
  periodo: {
    check_in: ISODate("2026-06-15"),
    check_out: ISODate("2026-06-20"),
    notti: 5
  },
  prezzo: {
    per_notte: NumberDecimal("250.00"),
    totale: NumberDecimal("1250.00"),
    valuta: "EUR"
  },
  stato: "confermata",
  data_prenotazione: new Date(),
  pagamento: {
    metodo: "carta_credito",
    stato: "completato",
    transazione_id: "TRX-ABC123"
  },
  note_speciali: "Late check-out richiesto"
})
```

---

## Riepilogo

In questo capitolo hai imparato:

✅ Come inserire documenti con `insertOne()` e `insertMany()`  
✅ La struttura e il funzionamento del campo `_id`  
✅ Cos'è ObjectId e le sue proprietà  
✅ I tipi di dati BSON supportati da MongoDB  
✅ Come creare documenti con strutture complesse (array, oggetti annidati)  
✅ Le best practices per l'inserimento dei dati  
✅ Come gestire gli errori di inserimento  
✅ Esempi pratici di modellazione dei dati

Nel prossimo capitolo, esplorerai in dettaglio le operazioni di **Read** (lettura) per interrogare i dati in modo efficace.

---

## Esercizi

Vai alla cartella [esercizi/](./esercizi/) per mettere in pratica i concetti appresi!
