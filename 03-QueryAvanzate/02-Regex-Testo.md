# Capitolo 9 — Espressioni Regolari e Ricerca Testuale

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Usare espressioni regolari (regex) per ricerche testuali flessibili
- Creare e gestire indici di testo (`text index`)
- Implementare ricerca full-text con l'operatore `$text`
- Configurare lingua, case sensitivity e altri parametri di ricerca
- Valutare le performance e scegliere l'approccio migliore

---

## 1. Espressioni Regolari (Regex)

### 1.1 Sintassi Base

MongoDB supporta le **espressioni regolari** usando la sintassi PCRE (Perl Compatible Regular Expressions):

```javascript
// Sintassi 1: Operatore $regex
db.collezione.find({ 
  campo: { $regex: /pattern/ } 
})

// Sintassi 2: Direttamente con slash
db.collezione.find({ 
  campo: /pattern/ 
})

// Sintassi 3: Stringa + opzioni
db.collezione.find({ 
  campo: { $regex: "pattern", $options: "i" } 
})
```

### 1.2 Pattern Comuni

**Ricerca case-insensitive:**

```javascript
// Trova "MongoDB", "mongodb", "MONGODB", etc.
db.articoli.find({ 
  titolo: { $regex: /mongodb/i } 
})
// Opzione "i" = case insensitive
```

**Ricerca per prefisso (starts with):**

```javascript
// Utenti con email che inizia con "admin"
db.utenti.find({ 
  email: { $regex: /^admin/ } 
})
// ^ = inizio stringa
```

**Ricerca per suffisso (ends with):**

```javascript
// Email con dominio @gmail.com
db.utenti.find({ 
  email: { $regex: /@gmail\.com$/ } 
})
// $ = fine stringa
// \. = punto letterale (escaped)
```

**Ricerca per substring (contains):**

```javascript
// Prodotti con "phone" nel nome
db.prodotti.find({ 
  nome: { $regex: /phone/ } 
})

// Case insensitive
db.prodotti.find({ 
  nome: { $regex: /phone/i } 
})
```

### 1.3 Pattern Avanzati

**Caratteri speciali:**

```javascript
// Qualsiasi carattere: .
db.prodotti.find({ codice: { $regex: /PRD.001/ } })
// Match: "PRD-001", "PRD_001", "PRDx001"

// Zero o più: *
db.articoli.find({ titolo: { $regex: /MongoDB.* tutorial/ } })
// Match: "MongoDB tutorial", "MongoDB advanced tutorial"

// Uno o più: +
db.articoli.find({ titolo: { $regex: /MongoDB.+ tutorial/ } })
// Match: "MongoDB advanced tutorial" (almeno un carattere tra)

// Zero o uno: ?
db.prodotti.find({ codice: { $regex: /colou?r/ } })
// Match: "color" o "colour"

// Alternativa: |
db.articoli.find({ tag: { $regex: /javascript|typescript/ } })
// Match: articoli con tag "javascript" O "typescript"

// Gruppi: ()
db.utenti.find({ username: { $regex: /(admin|root)_user/ } })
// Match: "admin_user" o "root_user"

// Range di caratteri: []
db.prodotti.find({ codice: { $regex: /[A-Z]{3}-[0-9]{4}/ } })
// Match: "ABC-1234" (3 lettere maiuscole, dash, 4 numeri)
```

**Quantificatori:**

```javascript
// Esattamente n: {n}
db.codici.find({ codice: { $regex: /[0-9]{5}/ } })
// Esattamente 5 cifre

// Minimo n: {n,}
db.codici.find({ codice: { $regex: /[A-Z]{3,}/ } })
// Almeno 3 lettere maiuscole

// Range: {n,m}
db.prodotti.find({ nome: { $regex: /^.{5,20}$/ } })
// Nome lungo tra 5 e 20 caratteri
```

### 1.4 Opzioni Regex

| Opzione | Descrizione | Esempio |
|---------|-------------|---------|
| `i` | Case insensitive | `/mongodb/i` |
| `m` | Multiline (^ e $ matchano ogni riga) | `/^start/m` |
| `x` | Ignora whitespace (extended) | `/a b c/x` |
| `s` | Dot (.) matcha anche newline | `/a.b/s` |

```javascript
// Combinare opzioni
db.articoli.find({ 
  contenuto: { 
    $regex: /^capitolo/im 
  } 
})
// Case insensitive + multiline
```

### 1.5 Esempi Pratici

**Validazione email:**

```javascript
// Email valide (semplificato)
db.utenti.find({ 
  email: { 
    $regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ 
  } 
})
```

**Ricerca codici fiscali italiani:**

```javascript
// Formato: 6 lettere + 2 cifre + 1 lettera + 2 cifre + 1 lettera + 3 cifre + 1 lettera
db.persone.find({ 
  codiceFiscale: { 
    $regex: /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i 
  } 
})
```

**Ricerca numeri di telefono:**

```javascript
// Italiano: +39 o 0039 seguito da 9-10 cifre
db.contatti.find({ 
  telefono: { 
    $regex: /^(\+39|0039)?[0-9]{9,10}$/ 
  } 
})
```

**Ricerca URL:**

```javascript
// URL HTTP/HTTPS
db.link.find({ 
  url: { 
    $regex: /^https?:\/\/.+/ 
  } 
})
```

---

## 2. Indici di Testo (Text Index)

### 2.1 Cos'è un Text Index?

Un **text index** permette ricerche **full-text** su campi stringa:
- Tokenizzazione automatica (split su spazi, punteggiatura)
- Stemming (riduzione a radice: "running" → "run")
- Stop words (ignora parole comuni: "the", "a", "is")
- Supporto multilingua

### 2.2 Creare un Text Index

**Singolo campo:**

```javascript
// Indice text sul campo "descrizione"
db.prodotti.createIndex({ descrizione: "text" })
```

**Campi multipli:**

```javascript
// Indice text su titolo E contenuto
db.articoli.createIndex({ 
  titolo: "text", 
  contenuto: "text" 
})
```

**Peso dei campi:**

```javascript
// Titolo ha peso maggiore (10x) rispetto al contenuto
db.articoli.createIndex(
  { 
    titolo: "text", 
    contenuto: "text" 
  },
  { 
    weights: { 
      titolo: 10, 
      contenuto: 1 
    } 
  }
)
```

**Indice text "wildcard" (tutti i campi stringa):**

```javascript
// Indicizza TUTTI i campi stringa
db.collezione.createIndex({ "$**": "text" })
```

### 2.3 Limitazioni Text Index

⚠️ **Una collezione può avere UN SOLO text index!**

```javascript
// ❌ ERRORE: non puoi avere 2 text index
db.articoli.createIndex({ titolo: "text" })
db.articoli.createIndex({ descrizione: "text" })  // ERRORE!

// ✅ Soluzione: Combina in un unico indice
db.articoli.createIndex({ 
  titolo: "text", 
  descrizione: "text" 
})
```

**Eliminare text index:**

```javascript
// Lista indici
db.articoli.getIndexes()

// Elimina per nome
db.articoli.dropIndex("titolo_text_contenuto_text")

// Oppure drop e ricrea
db.articoli.dropIndex("titolo_text")
db.articoli.createIndex({ titolo: "text", nuovo_campo: "text" })
```

---

## 3. Operatore `$text` - Ricerca Full-Text

### 3.1 Ricerca Base

```javascript
// Trova documenti con parola "mongodb"
db.articoli.find({ 
  $text: { $search: "mongodb" } 
})
```

**Caratteristiche:**
- Case insensitive di default
- Cerca in TUTTI i campi indicizzati
- Usa stemming (es: "running" trova anche "run")

### 3.2 Ricerca Multipla - Parole (OR)

```javascript
// Trova documenti con "mongodb" O "database" O "nosql"
db.articoli.find({ 
  $text: { $search: "mongodb database nosql" } 
})
```

**Comportamento:** Cerca documenti che contengono **almeno una** delle parole.

### 3.3 Frase Esatta (con Virgolette)

```javascript
// Trova frase esatta "database nosql"
db.articoli.find({ 
  $text: { $search: "\"database nosql\"" } 
})
// Nota: escape delle virgolette interne
```

**Differenza:**

```javascript
// Senza virgolette: trova "database" O "nosql" separati
$text: { $search: "database nosql" }

// Con virgolette: trova solo "database nosql" consecutivi
$text: { $search: "\"database nosql\"" }
```

### 3.4 Esclusione Parole (con -)

```javascript
// Trova "mongodb" ma ESCLUDE documenti con "sql"
db.articoli.find({ 
  $text: { $search: "mongodb -sql" } 
})

// Trova "database" ma non "relazionale"
db.articoli.find({ 
  $text: { $search: "database -relazionale" } 
})
```

### 3.5 Combinazioni Avanzate

```javascript
// "mongodb" E frase esatta "nosql database" SENZA "sql"
db.articoli.find({ 
  $text: { $search: "mongodb \"nosql database\" -sql" } 
})

// "javascript" O "typescript" ma non "java"
db.tutorial.find({ 
  $text: { $search: "javascript typescript -java" } 
})
```

---

## 4. Score di Rilevanza

### 4.1 Text Score

MongoDB assegna uno **score** a ogni risultato basato sulla rilevanza:
- Quante parole matchano
- Peso dei campi
- Frequenza della parola

**Proiezione dello score:**

```javascript
db.articoli.find(
  { $text: { $search: "mongodb tutorial" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

**Output esempio:**

```json
{
  "_id": ObjectId("..."),
  "titolo": "MongoDB Tutorial Avanzato",
  "contenuto": "Impara mongodb con esempi pratici...",
  "score": 2.5
}
```

### 4.2 Ordinamento per Rilevanza

```javascript
// Ordina per rilevanza decrescente
db.articoli.find(
  { $text: { $search: "mongodb" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

### 4.3 Filtrare per Score Minimo

```javascript
// Solo risultati con score >= 2.0
db.articoli.find({
  $text: { $search: "mongodb tutorial" },
  score: { $meta: "textScore" }
}).match({
  $expr: { $gte: [{ $meta: "textScore" }, 2.0] }
})
```

**Nota:** Più comune usare aggregation:

```javascript
db.articoli.aggregate([
  { $match: { $text: { $search: "mongodb" } } },
  { $addFields: { score: { $meta: "textScore" } } },
  { $match: { score: { $gte: 2.0 } } },
  { $sort: { score: -1 } }
])
```

---

## 5. Opzioni di Ricerca Testuale

### 5.1 Lingua (`$language`)

MongoDB supporta **stemming** per diverse lingue:

```javascript
// Indice con lingua italiana
db.articoli.createIndex(
  { contenuto: "text" },
  { default_language: "italian" }
)

// Ricerca con lingua specifica
db.articoli.find({ 
  $text: { 
    $search: "correre", 
    $language: "italian" 
  } 
})
// Trova anche: "corro", "correva", "corrono" (stemming)
```

**Lingue supportate:** Italian, English, Spanish, French, German, Portuguese, Russian, Arabic, Turkish, e altre...

**Documento con lingua specifica:**

```javascript
// Documento con campo lingua
{
  titolo: "Introduction to MongoDB",
  contenuto: "MongoDB is a database...",
  language: "english"
}

{
  titolo: "Introduzione a MongoDB",
  contenuto: "MongoDB è un database...",
  language: "italian"
}

// Query rispetta la lingua del documento
db.articoli.find({ $text: { $search: "database" } })
```

### 5.2 Case Sensitivity (`$caseSensitive`)

Di default, la ricerca è **case insensitive**. Puoi forzare case sensitivity:

```javascript
// Case sensitive: solo "MongoDB" maiuscolo
db.articoli.find({ 
  $text: { 
    $search: "MongoDB", 
    $caseSensitive: true 
  } 
})
```

⚠️ **Raramente usato:** nella maggior parte dei casi vuoi case insensitive.

### 5.3 Diacritics Sensitivity (`$diacriticSensitive`)

Controlla se distinguere caratteri accentati:

```javascript
// Distingue "café" da "cafe"
db.ristoranti.find({ 
  $text: { 
    $search: "café", 
    $diacriticSensitive: true 
  } 
})

// Trova sia "café" che "cafe" (default)
db.ristoranti.find({ 
  $text: { 
    $search: "café", 
    $diacriticSensitive: false 
  } 
})
```

---

## 6. Regex vs Text Index: Quando Usare Cosa?

### 6.1 Confronto

| Aspetto | Regex | Text Index |
|---------|-------|------------|
| **Setup** | Nessuno | Richiede creazione indice |
| **Performance** | Lenta su grandi dataset | Veloce con indice |
| **Stemming** | ❌ No | ✅ Sì |
| **Stop words** | ❌ No | ✅ Sì (ignorate) |
| **Rilevanza** | ❌ No score | ✅ Text score |
| **Flessibilità** | ✅ Pattern complessi | ❌ Solo parole/frasi |
| **Multilingua** | ❌ Manuale | ✅ Supporto nativo |
| **Limiti** | Nessuno | 1 text index/collezione |

### 6.2 Quando Usare Regex

✅ **Usa regex quando:**
- Cerchi **pattern specifici** (es: email, telefoni, codici)
- Hai **dataset piccoli** (< 10k documenti)
- Serve ricerca per **prefisso/suffisso** preciso
- Non hai bisogno di stemming
- Vuoi ricerche su **campi multipli** con logiche diverse

**Esempi:**

```javascript
// ✅ Perfetto per regex
db.utenti.find({ email: { $regex: /@gmail\.com$/ } })
db.prodotti.find({ codice: { $regex: /^PROD-[0-9]{4}$/ } })
db.articoli.find({ titolo: { $regex: /^MongoDB/ } })  // Inizia con
```

### 6.3 Quando Usare Text Index

✅ **Usa text index quando:**
- Ricerca **full-text** su contenuti lunghi
- Dataset **grandi** (> 10k documenti)
- Serve **stemming** (varianti parole)
- Vuoi ordinare per **rilevanza**
- Supporto **multilingua**

**Esempi:**

```javascript
// ✅ Perfetto per text index
db.articoli.find({ $text: { $search: "mongodb tutorial" } })
db.prodotti.find({ $text: { $search: "laptop gaming" } })
db.documenti.find({ $text: { $search: "\"artificial intelligence\"" } })
```

### 6.4 Ibrido: Combinare Entrambi

```javascript
// Regex per filtro iniziale + text per contenuto
db.articoli.find({ 
  categoria: { $regex: /^tech/i },  // Categoria inizia con "tech"
  $text: { $search: "mongodb" }     // Contenuto parla di mongodb
})

// Attenzione: Text index non può essere usato se regex è troppo generico!
```

---

## 7. Performance e Ottimizzazione

### 7.1 Indici per Regex

⚠️ **Regex può usare indici SOLO per prefisso!**

```javascript
// ✅ Usa indice (prefisso)
db.utenti.find({ username: { $regex: /^admin/ } })

// ❌ NON usa indice (suffisso)
db.utenti.find({ username: { $regex: /admin$/ } })

// ❌ NON usa indice (substring)
db.utenti.find({ username: { $regex: /admin/ } })
```

**Creare indice:**

```javascript
// Indice normale su campo
db.utenti.createIndex({ username: 1 })

// Ora regex con ^ può usare l'indice
db.utenti.find({ username: { $regex: /^admin/ } })
```

### 7.2 Text Index Performance

**Best practices:**

✅ **Combina con filtri normali:**

```javascript
// Prima filtra con indice normale, poi text search
db.articoli.find({ 
  categoria: "tutorial",  // Filtro veloce
  $text: { $search: "mongodb" }  // Text search su subset
})
```

✅ **Usa proiezioni:**

```javascript
// Non caricare campi grandi non necessari
db.articoli.find(
  { $text: { $search: "mongodb" } },
  { titolo: 1, _id: 1 }  // Solo titolo e _id
)
```

❌ **Evita ricerche generiche su dataset enormi:**

```javascript
// ❌ Troppo generico su 1M documenti
db.articoli.find({ $text: { $search: "a" } })

// ✅ Meglio: Aggiungi filtri
db.articoli.find({ 
  anno: { $gte: 2020 },
  $text: { $search: "mongodb" }
})
```

### 7.3 Monitoraggio Performance

```javascript
// Analizza query con explain
db.articoli.find({ 
  $text: { $search: "mongodb" } 
}).explain("executionStats")

// Guarda questi campi:
// - executionTimeMillis (tempo esecuzione)
// - totalDocsExamined (documenti esaminati)
// - totalKeysExamined (chiavi indice esaminate)
```

---

## 8. Esempi Completi

### 8.1 Blog con Ricerca Avanzata

```javascript
// Collezione articoli
db.articoli.insertMany([
  {
    titolo: "Introduzione a MongoDB",
    contenuto: "MongoDB è un database NoSQL document-oriented...",
    autore: "Mario Rossi",
    categoria: "Tutorial",
    tags: ["mongodb", "database", "nosql"],
    lingua: "italian",
    pubblicato: ISODate("2024-01-15")
  },
  {
    titolo: "MongoDB Aggregation Pipeline",
    contenuto: "La pipeline di aggregazione permette operazioni complesse...",
    autore: "Luigi Verdi",
    categoria: "Tutorial",
    tags: ["mongodb", "aggregation", "avanzato"],
    lingua: "italian",
    pubblicato: ISODate("2024-02-01")
  }
])

// Crea text index
db.articoli.createIndex(
  { titolo: "text", contenuto: "text" },
  { 
    weights: { titolo: 10, contenuto: 1 },
    default_language: "italian"
  }
)

// Query 1: Ricerca full-text
db.articoli.find({ 
  $text: { $search: "mongodb aggregazione" } 
})

// Query 2: Con score ordinato
db.articoli.find(
  { $text: { $search: "mongodb" } },
  { score: { $meta: "textScore" }, titolo: 1, autore: 1 }
).sort({ score: { $meta: "textScore" } })

// Query 3: Ricerca + filtro categoria
db.articoli.find({ 
  categoria: "Tutorial",
  $text: { $search: "aggregazione" } 
})

// Query 4: Frase esatta
db.articoli.find({ 
  $text: { $search: "\"database NoSQL\"" } 
})

// Query 5: Esclusione
db.articoli.find({ 
  $text: { $search: "mongodb -sql" } 
})
```

### 8.2 E-commerce con Ricerca Prodotti

```javascript
// Collezione prodotti
db.prodotti.insertMany([
  {
    nome: "Laptop Gaming ASUS ROG",
    descrizione: "Potente laptop per gaming con RTX 4080...",
    categoria: "Elettronica",
    sottocategoria: "Computer",
    prezzo: 2499.99,
    marca: "ASUS",
    codice: "LAP-ASUS-001",
    tags: ["gaming", "laptop", "rtx"]
  },
  {
    nome: "Mouse Gaming Logitech G502",
    descrizione: "Mouse ergonomico con sensore ottico...",
    categoria: "Elettronica",
    sottocategoria: "Periferiche",
    prezzo: 79.99,
    marca: "Logitech",
    codice: "MOU-LOG-502",
    tags: ["gaming", "mouse", "rgb"]
  }
])

// Text index
db.prodotti.createIndex({ 
  nome: "text", 
  descrizione: "text" 
})

// Ricerca 1: Prodotti gaming
db.prodotti.find({ 
  $text: { $search: "gaming" } 
})

// Ricerca 2: Laptop con GPU
db.prodotti.find({ 
  $text: { $search: "laptop rtx" } 
})

// Ricerca 3: Filtro per prezzo + text
db.prodotti.find({ 
  prezzo: { $lt: 100 },
  $text: { $search: "gaming" } 
})

// Ricerca 4: Per codice (regex)
db.prodotti.find({ 
  codice: { $regex: /^LAP-/ } 
})

// Ricerca 5: Marca + text (ibrido)
db.prodotti.find({ 
  marca: "ASUS",
  $text: { $search: "gaming laptop" } 
})
```

### 8.3 Sistema di Supporto con Tickets

```javascript
// Collezione tickets
db.tickets.insertMany([
  {
    numero: "TICK-2024-001",
    titolo: "Problema connessione database MongoDB",
    descrizione: "L'applicazione non riesce a connettersi a MongoDB Atlas...",
    cliente: {
      nome: "Azienda XYZ",
      email: "support@xyz.com"
    },
    stato: "aperto",
    priorita: "alta",
    tags: ["mongodb", "connessione", "atlas"],
    dataCreazione: ISODate("2024-01-10")
  }
])

// Text index
db.tickets.createIndex({ 
  titolo: "text", 
  descrizione: "text" 
})

// Query 1: Tutti i ticket su MongoDB
db.tickets.find({ 
  $text: { $search: "mongodb" } 
})

// Query 2: Ticket aperti con problema connessione
db.tickets.find({ 
  stato: "aperto",
  $text: { $search: "connessione database" } 
})

// Query 3: Alta priorità + keyword
db.tickets.find({ 
  priorita: "alta",
  $text: { $search: "mongodb" } 
}).sort({ dataCreazione: -1 })

// Query 4: Cerca per numero ticket (regex)
db.tickets.find({ 
  numero: { $regex: /^TICK-2024/ } 
})
```

---

## 9. Esercizi Pratici

### Esercizio 1: Sistema Blog

Crea una collezione `posts` e implementa:

1. Text index su titolo e contenuto
2. Ricerca full-text per keyword
3. Ricerca frase esatta
4. Filtro per autore + keyword
5. Ordinamento per score

### Esercizio 2: Ricerca Email

Crea regex per validare:

1. Email standard
2. Email con sottodomini
3. Email governative (.gov)
4. Email educative (.edu)

### Esercizio 3: Catalogo Libri

Implementa ricerca con:

1. ISBN (regex formato)
2. Autore (case insensitive)
3. Titolo (text search)
4. Anno pubblicazione + keyword

---

## 10. Riepilogo

**Espressioni Regolari:**
- Usa `/pattern/` per ricerche flessibili
- Opzioni: `i` (case insensitive), `m` (multiline)
- Performance: indice funziona solo con prefisso `^`

**Text Index:**
- UN solo text index per collezione
- Full-text search con `$text`
- Score di rilevanza con `$meta: "textScore"`
- Supporto multilingua con stemming

**Best Practices:**
- Regex: pattern, prefissi, validazioni
- Text index: contenuti lunghi, ricerca multiparola
- Combina entrambi quando necessario
- Monitora performance con `explain()`

**Risorse:**
- [Query Operators - $regex](https://www.mongodb.com/docs/manual/reference/operator/query/regex/)
- [Text Indexes](https://www.mongodb.com/docs/manual/core/index-text/)
- [Text Search](https://www.mongodb.com/docs/manual/text-search/)

---

**Prossimo capitolo:** [Aggregation Pipeline](./03-Aggregation.md)
