# Capitolo 8 — Query su Documenti Annidati e Array

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Usare la dot notation per interrogare campi annidati
- Cercare documenti in base ad elementi di array
- Applicare operatori avanzati per array: `$in`, `$nin`, `$all`, `$elemMatch`, `$size`
- Verificare l'esistenza e il tipo di un campo con `$exists` e `$type`
- Combinare query complesse su strutture dati articolate

---

## 1. Dot Notation: Accedere ai Campi Annidati

### 1.1 Documenti Embedded

MongoDB permette di **annidare documenti** all'interno di altri documenti. Per accedere ai campi nested si usa la **dot notation** (`.`):

**Esempio documento:**

```javascript
{
  _id: ObjectId("..."),
  nome: "Mario Rossi",
  indirizzo: {
    via: "Via Roma 123",
    citta: "Milano",
    cap: "20100",
    coordinate: {
      lat: 45.4642,
      lon: 9.1900
    }
  },
  età: 35
}
```

**Query con dot notation:**

```javascript
// Trova persone che vivono a Milano
db.persone.find({ "indirizzo.citta": "Milano" })

// Trova persone in una specifica zona (coordinate)
db.persone.find({ "indirizzo.coordinate.lat": { $gt: 45 } })

// Trova persone con CAP specifico
db.persone.find({ "indirizzo.cap": "20100" })
```

**Note importanti:**
- Le chiavi con dot notation devono essere **tra virgolette**
- La sintassi è `"campo.sottocampo.sottosottocampo"`
- Funziona a qualsiasi livello di profondità

### 1.2 Query su Documenti Embedded Completi

Puoi anche cercare documenti embedded **interi** (matching esatto):

```javascript
// Trova persone con indirizzo esattamente questo
db.persone.find({
  indirizzo: {
    via: "Via Roma 123",
    citta: "Milano",
    cap: "20100"
  }
})
```

⚠️ **Attenzione:** L'ordine dei campi deve essere **identico** e tutti i campi devono essere presenti. Generalmente è meglio usare la dot notation per maggiore flessibilità.

---

## 2. Query su Array

### 2.1 Array Semplici

MongoDB tratta gli array in modo speciale: puoi cercare un **singolo valore** e troverà i documenti che contengono quel valore nell'array.

**Esempio documento:**

```javascript
{
  _id: ObjectId("..."),
  titolo: "Il Signore degli Anelli",
  autore: "J.R.R. Tolkien",
  generi: ["Fantasy", "Avventura", "Epico"],
  tags: ["classico", "fantasy", "trilogia"]
}
```

**Query base su array:**

```javascript
// Trova libri con genere "Fantasy"
db.libri.find({ generi: "Fantasy" })

// Anche se "Fantasy" è in un array, questa query funziona!
```

### 2.2 Operatore `$in`: Matching di Valori Multipli

Trova documenti dove il campo contiene **almeno uno** dei valori specificati:

```javascript
// Libri di genere Fantasy O Avventura
db.libri.find({ 
  generi: { $in: ["Fantasy", "Avventura"] } 
})

// Tags che includono "classico" O "bestseller"
db.libri.find({ 
  tags: { $in: ["classico", "bestseller"] } 
})
```

**Uso con campi non-array:**

```javascript
// Trova autori specifici
db.libri.find({ 
  autore: { $in: ["Tolkien", "Rowling", "Martin"] } 
})
```

### 2.3 Operatore `$nin`: Not In

L'opposto di `$in` - trova documenti che **NON** contengono nessuno dei valori:

```javascript
// Libri senza generi Horror o Thriller
db.libri.find({ 
  generi: { $nin: ["Horror", "Thriller"] } 
})
```

### 2.4 Operatore `$all`: Match Tutti i Valori

Trova documenti dove l'array contiene **tutti** i valori specificati (in qualsiasi ordine):

```javascript
// Libri che sono CONTEMPORANEAMENTE Fantasy E Avventura
db.libri.find({ 
  generi: { $all: ["Fantasy", "Avventura"] } 
})

// Tags che includono TUTTI questi
db.libri.find({ 
  tags: { $all: ["classico", "fantasy"] } 
})
```

**Differenza `$in` vs `$all`:**

```javascript
generi: ["Fantasy", "Avventura", "Epico"]

// Questo MATCH con $in (almeno uno)
{ generi: { $in: ["Horror", "Fantasy"] } }  // ✅ Trova (ha "Fantasy")

// Questo NO MATCH con $all (deve avere tutti)
{ generi: { $all: ["Fantasy", "Horror"] } }  // ❌ Non trova (manca "Horror")
```

### 2.5 Operatore `$size`: Lunghezza dell'Array

Trova documenti dove l'array ha una **lunghezza specifica**:

```javascript
// Libri con esattamente 3 generi
db.libri.find({ generi: { $size: 3 } })

// Libri con 5 tags
db.libri.find({ tags: { $size: 5 } })
```

⚠️ **Limitazioni:**
- `$size` funziona solo con un **valore esatto** (non range)
- Non puoi fare `{ $size: { $gt: 3 } }` ❌

**Workaround per range:**

Devi usare `$expr` con `$size`:

```javascript
// Array con più di 3 elementi
db.libri.find({
  $expr: { $gt: [{ $size: "$generi" }, 3] }
})

// Array con meno di 5 elementi
db.libri.find({
  $expr: { $lt: [{ $size: "$tags" }, 5] }
})
```

---

## 3. Array di Documenti (Subdocuments)

### 3.1 Struttura Tipica

Array che contengono **oggetti** (subdocuments):

```javascript
{
  _id: ObjectId("..."),
  corso: "MongoDB Avanzato",
  studenti: [
    { nome: "Alice", voto: 28, presente: true },
    { nome: "Bob", voto: 25, presente: false },
    { nome: "Charlie", voto: 30, presente: true }
  ]
}
```

### 3.2 Dot Notation su Array di Subdocuments

```javascript
// Corsi con almeno uno studente di nome "Alice"
db.corsi.find({ "studenti.nome": "Alice" })

// Corsi con almeno uno studente con voto >= 28
db.corsi.find({ "studenti.voto": { $gte: 28 } })

// Corsi con studenti presenti
db.corsi.find({ "studenti.presente": true })
```

⚠️ **Problema:** Queste query controllano le condizioni **separatamente** su elementi diversi dell'array!

```javascript
// Esempio ambiguo:
db.corsi.find({ 
  "studenti.nome": "Alice",
  "studenti.voto": { $gte: 28 }
})
// Trova corsi dove:
// - C'È uno studente di nome "Alice" (anche con voto < 28)
// - C'È uno studente con voto >= 28 (anche se non si chiama Alice)
```

### 3.3 Operatore `$elemMatch`: Match su Singolo Elemento

`$elemMatch` risolve il problema: le condizioni devono essere **tutte vere sullo stesso elemento** dell'array.

```javascript
// Trova corsi dove ALICE ha voto >= 28
db.corsi.find({
  studenti: {
    $elemMatch: { 
      nome: "Alice", 
      voto: { $gte: 28 } 
    }
  }
})

// Studenti presenti E con voto >= 27
db.corsi.find({
  studenti: {
    $elemMatch: { 
      presente: true, 
      voto: { $gte: 27 } 
    }
  }
})
```

**Quando usare `$elemMatch`:**
- ✅ Quando hai **multiple condizioni** sullo stesso subdocument
- ❌ Non necessario per singola condizione (usa dot notation)

### 3.4 Esempio Completo: E-commerce

```javascript
// Documento ordine
{
  _id: ObjectId("..."),
  numeroOrdine: "ORD-2024-001",
  cliente: "Mario Rossi",
  prodotti: [
    { codice: "PROD-A", nome: "Laptop", prezzo: 1200, quantita: 1 },
    { codice: "PROD-B", nome: "Mouse", prezzo: 25, quantita: 2 },
    { codice: "PROD-C", nome: "Tastiera", prezzo: 80, quantita: 1 }
  ],
  totale: 1330,
  stato: "spedito"
}
```

**Query:**

```javascript
// Ordini con almeno un prodotto costoso (>= 1000)
db.ordini.find({ "prodotti.prezzo": { $gte: 1000 } })

// Ordini con prodotto specifico
db.ordini.find({ "prodotti.codice": "PROD-A" })

// Ordini con prodotto costoso E quantità >= 2
// (STESSO prodotto deve soddisfare entrambe)
db.ordini.find({
  prodotti: {
    $elemMatch: { 
      prezzo: { $gte: 1000 }, 
      quantita: { $gte: 2 } 
    }
  }
})

// Ordini con almeno 3 prodotti diversi
db.ordini.find({
  $expr: { $gte: [{ $size: "$prodotti" }, 3] }
})
```

---

## 4. Operatori `$exists` e `$type`

### 4.1 Operatore `$exists`: Verifica Presenza Campo

Controlla se un campo **esiste** nel documento (indipendentemente dal valore):

```javascript
// Documenti che HANNO il campo "email"
db.utenti.find({ email: { $exists: true } })

// Documenti che NON HANNO il campo "telefono"
db.utenti.find({ telefono: { $exists: false } })
```

**Casi d'uso:**

```javascript
// Trova prodotti con sconto applicato
db.prodotti.find({ sconto: { $exists: true } })

// Trova documenti incompleti (manca campo obbligatorio)
db.clienti.find({ indirizzo: { $exists: false } })

// Combina con altri operatori
db.utenti.find({ 
  email: { $exists: true },
  verificato: false
})
```

### 4.2 Operatore `$type`: Verifica Tipo di Dato

Controlla il **tipo BSON** di un campo:

```javascript
// Campi che sono stringhe
db.collezione.find({ nome: { $type: "string" } })

// Campi che sono numeri
db.collezione.find({ età: { $type: "number" } })

// Campi che sono date
db.eventi.find({ dataInizio: { $type: "date" } })

// Campi che sono array
db.posts.find({ tags: { $type: "array" } })

// Campi che sono ObjectId
db.collezione.find({ _id: { $type: "objectId" } })
```

**Tipi BSON comuni:**

| Tipo | Alias stringa | Numero |
|------|---------------|--------|
| Double | `"double"` | 1 |
| String | `"string"` | 2 |
| Object | `"object"` | 3 |
| Array | `"array"` | 4 |
| Binary data | `"binData"` | 5 |
| ObjectId | `"objectId"` | 7 |
| Boolean | `"bool"` | 8 |
| Date | `"date"` | 9 |
| Null | `"null"` | 10 |
| Regular Expression | `"regex"` | 11 |
| JavaScript | `"javascript"` | 13 |
| 32-bit integer | `"int"` | 16 |
| Timestamp | `"timestamp"` | 17 |
| 64-bit integer | `"long"` | 18 |
| Decimal128 | `"decimal"` | 19 |

**Esempio pratico - Data quality:**

```javascript
// Trova documenti con "età" salvata come stringa (errore!)
db.utenti.find({ età: { $type: "string" } })

// Trova prezzi non numerici
db.prodotti.find({ 
  prezzo: { 
    $not: { $type: "number" } 
  }
})

// Campi null vs mancanti
db.collezione.find({ campo: null })  // Trova null E campo mancante
db.collezione.find({ campo: { $type: "null" } })  // Solo null espliciti
db.collezione.find({ campo: { $exists: false } })  // Solo mancanti
```

### 4.3 Combinare `$exists` e `$type`

```javascript
// Email esistente e di tipo stringa
db.utenti.find({
  email: { 
    $exists: true, 
    $type: "string" 
  }
})

// Età esistente, numerica e > 18
db.utenti.find({
  età: { 
    $exists: true,
    $type: "number",
    $gte: 18
  }
})
```

---

## 5. Query Complesse: Combinazioni

### 5.1 Esempio: Blog

```javascript
// Documento post
{
  _id: ObjectId("..."),
  titolo: "Introduzione a MongoDB",
  autore: {
    nome: "Mario Rossi",
    email: "mario@example.com",
    ruolo: "developer"
  },
  contenuto: "...",
  tags: ["database", "nosql", "mongodb", "tutorial"],
  commenti: [
    { utente: "Alice", testo: "Ottimo articolo!", data: ISODate("2024-01-15") },
    { utente: "Bob", testo: "Molto utile", data: ISODate("2024-01-16") }
  ],
  visualizzazioni: 1250,
  pubblicato: true,
  dataCreazione: ISODate("2024-01-10")
}
```

**Query avanzate:**

```javascript
// Post di autori developer
db.posts.find({ "autore.ruolo": "developer" })

// Post con tag "mongodb" E pubblicati
db.posts.find({ 
  tags: "mongodb",
  pubblicato: true
})

// Post con più di 1000 visualizzazioni e almeno 2 commenti
db.posts.find({
  visualizzazioni: { $gt: 1000 },
  $expr: { $gte: [{ $size: "$commenti" }, 2] }
})

// Post con commenti di Alice dopo il 15 gennaio
db.posts.find({
  commenti: {
    $elemMatch: {
      utente: "Alice",
      data: { $gt: ISODate("2024-01-15") }
    }
  }
})

// Post senza commenti
db.posts.find({ commenti: { $size: 0 } })
// Oppure:
db.posts.find({ commenti: { $exists: true, $eq: [] } })

// Post con TUTTI questi tag
db.posts.find({ 
  tags: { $all: ["mongodb", "tutorial"] } 
})

// Post con 3-5 tag
db.posts.find({
  $expr: { 
    $and: [
      { $gte: [{ $size: "$tags" }, 3] },
      { $lte: [{ $size: "$tags" }, 5] }
    ]
  }
})
```

### 5.2 Esempio: Sistema di Prenotazioni

```javascript
// Documento hotel
{
  _id: ObjectId("..."),
  nome: "Grand Hotel Milano",
  indirizzo: {
    via: "Corso Buenos Aires 52",
    citta: "Milano",
    cap: "20124",
    coordinate: { lat: 45.4778, lon: 9.2084 }
  },
  camere: [
    { numero: 101, tipo: "singola", prezzo: 80, occupata: false },
    { numero: 102, tipo: "doppia", prezzo: 120, occupata: true },
    { numero: 201, tipo: "suite", prezzo: 250, occupata: false }
  ],
  servizi: ["wifi", "parcheggio", "colazione", "piscina"],
  stelle: 4,
  recensioni: [
    { utente: "Cliente1", voto: 5, commento: "Eccellente" },
    { utente: "Cliente2", voto: 4, commento: "Buono" }
  ]
}
```

**Query:**

```javascript
// Hotel a Milano
db.hotel.find({ "indirizzo.citta": "Milano" })

// Hotel 4+ stelle con piscina
db.hotel.find({
  stelle: { $gte: 4 },
  servizi: "piscina"
})

// Hotel con camere libere (non occupate)
db.hotel.find({
  "camere.occupata": false
})

// Hotel con camere doppie libere e prezzo <= 150
db.hotel.find({
  camere: {
    $elemMatch: {
      tipo: "doppia",
      occupata: false,
      prezzo: { $lte: 150 }
    }
  }
})

// Hotel con almeno 3 servizi
db.hotel.find({
  $expr: { $gte: [{ $size: "$servizi" }, 3] }
})

// Hotel con recensioni tutte >= 4
db.hotel.find({
  "recensioni.voto": { $not: { $lt: 4 } }
})

// Hotel con media voti >= 4 (richiede aggregation)
db.hotel.aggregate([
  { $unwind: "$recensioni" },
  { $group: { 
      _id: "$_id", 
      nome: { $first: "$nome" },
      mediaVoti: { $avg: "$recensioni.voto" } 
  }},
  { $match: { mediaVoti: { $gte: 4 } } }
])
```

---

## 6. Best Practices

### 6.1 Performance

✅ **Usa indici su campi annidati frequentemente interrogati:**

```javascript
// Crea indice su campo nested
db.persone.createIndex({ "indirizzo.citta": 1 })

// Crea indice su campo array
db.libri.createIndex({ tags: 1 })
```

✅ **Limita la profondità di nesting:**
- Max 2-3 livelli per performance ottimali
- Documenti troppo annidati rallentano le query

❌ **Evita query con `$size` su array molto grandi:**
- MongoDB deve contare tutti gli elementi
- Considera memorizzare la lunghezza come campo separato

### 6.2 Data Modeling

**Quando usare embedding:**
- Dati "appartenenti" a un documento (indirizzo di una persona)
- Relazione 1-to-1 o 1-to-few
- Dati sempre letti insieme

**Quando usare riferimenti:**
- Relazioni molti-a-molti
- Dati condivisi tra documenti
- Documenti che superano 16MB

**Esempio:**

```javascript
// ✅ Buon embedding: Indirizzo
{
  nome: "Mario",
  indirizzo: { via: "...", citta: "..." }  // Sempre letto insieme
}

// ❌ Cattivo embedding: Ordini
{
  cliente: "Mario",
  ordini: [ /* 10000 ordini */ ]  // Array gigante!
}

// ✅ Meglio: Riferimenti
// Collezione clienti:
{ _id: 1, nome: "Mario" }

// Collezione ordini:
{ _id: 101, cliente_id: 1, ... }
{ _id: 102, cliente_id: 1, ... }
```

### 6.3 Validazione

```javascript
// Valida struttura con schema
db.createCollection("persone", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nome", "indirizzo"],
      properties: {
        nome: { bsonType: "string" },
        indirizzo: {
          bsonType: "object",
          required: ["citta"],
          properties: {
            via: { bsonType: "string" },
            citta: { bsonType: "string" },
            cap: { bsonType: "string" }
          }
        }
      }
    }
  }
})
```

---

## 7. Esercizi Pratici

### Esercizio 1: Biblioteca Digitale

Crea una collezione `biblioteca` con documenti:

```javascript
{
  titolo: "...",
  autore: {
    nome: "...",
    nazionalita: "...",
    annoNascita: ...
  },
  generi: [...],
  capitoli: [
    { numero: 1, titolo: "...", pagine: 25 },
    { numero: 2, titolo: "...", pagine: 30 }
  ],
  isbn: "...",
  copieDisponibili: ...
}
```

**Query da implementare:**

1. Libri di autori italiani
2. Libri con genere "Fantasy" o "Sci-Fi"
3. Libri con almeno 10 capitoli
4. Libri con un capitolo di più di 50 pagine
5. Libri con ISBN esistente
6. Libri pubblicati da autori nati dopo il 1950

### Esercizio 2: Negozio E-commerce

Crea collezione `prodotti`:

```javascript
{
  nome: "...",
  categoria: {
    principale: "...",
    sottocategorie: [...]
  },
  prezzo: ...,
  specifiche: {
    peso: ...,
    dimensioni: { l: ..., h: ..., p: ... },
    colori: [...]
  },
  recensioni: [
    { utente: "...", voto: ..., commento: "..." }
  ],
  disponibile: true/false
}
```

**Query:**
1. Prodotti in categoria "Elettronica"
2. Prodotti con almeno 5 recensioni
3. Prodotti con recensione di voto 5
4. Prodotti disponibili con prezzo < 100
5. Prodotti che hanno almeno una recensione con voto >= 4

---

## 8. Riepilogo

**Concetti chiave:**

| Tecnica | Uso | Sintassi |
|---------|-----|----------|
| **Dot notation** | Campi annidati | `"campo.sub.subsub"` |
| **$in** | Almeno uno dei valori | `{ $in: [val1, val2] }` |
| **$all** | Tutti i valori | `{ $all: [val1, val2] }` |
| **$size** | Lunghezza array | `{ $size: 3 }` |
| **$elemMatch** | Match su subdocument | `{ $elemMatch: {...} }` |
| **$exists** | Presenza campo | `{ $exists: true/false }` |
| **$type** | Tipo dato | `{ $type: "string" }` |

**Quando usare cosa:**

- Query su singolo campo nested → **Dot notation**
- Controllare elemento in array → **Valore diretto o `$in`**
- Multiple condizioni su array element → **`$elemMatch`**
- Verificare presenza campo → **`$exists`**
- Controllare tipo → **`$type`**

**Risorse:**
- [Query and Projection Operators](https://www.mongodb.com/docs/manual/reference/operator/query/)
- [Dot Notation](https://www.mongodb.com/docs/manual/core/document/#dot-notation)
- [Query Arrays](https://www.mongodb.com/docs/manual/tutorial/query-arrays/)

---

**Prossimo capitolo:** [Espressioni Regolari e Ricerca Testuale](./02-Regex-e-Testo.md)
