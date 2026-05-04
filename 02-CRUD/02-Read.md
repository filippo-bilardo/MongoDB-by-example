# Capitolo 5 — Read: Interrogare i dati

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Interrogare i documenti con `find()` e `findOne()`
- Usare operatori di confronto e logici
- Filtrare documenti con query complesse
- Utilizzare le proiezioni per selezionare campi specifici
- Ordinare, limitare e saltare risultati
- Eseguire query su array e documenti annidati

---

## 1. Operazioni di lettura base

### 1.1 `find()` - Trovare più documenti

```javascript
// Trova tutti i documenti
db.prodotti.find()

// Trova documenti con filtro
db.prodotti.find({ categoria: "Elettronica" })
```

### 1.2 `findOne()` - Trovare un singolo documento

```javascript
// Trova il primo documento
db.prodotti.findOne()

// Trova un documento specifico
db.prodotti.findOne({ nome: "iPhone 14 Pro" })
```

**Differenze:**
- `find()` restituisce un **cursore** (iterabile)
- `findOne()` restituisce un **documento singolo** o `null`

---

## 2. Operatori di confronto

### 2.1 Uguaglianza

```javascript
// Uguaglianza implicita
db.prodotti.find({ prezzo: 999.99 })

// Uguaglianza esplicita con $eq
db.prodotti.find({ prezzo: { $eq: 999.99 } })
```

### 2.2 Diverso da: `$ne`

```javascript
// Prodotti diversi dalla categoria "Smartphone"
db.prodotti.find({ categoria: { $ne: "Smartphone" } })

// Prodotti non disponibili
db.prodotti.find({ disponibile: { $ne: true } })
```

### 2.3 Maggiore e minore: `$gt`, `$gte`, `$lt`, `$lte`

```javascript
// Prodotti con prezzo maggiore di 500
db.prodotti.find({ prezzo: { $gt: 500 } })

// Prodotti con prezzo maggiore o uguale a 500
db.prodotti.find({ prezzo: { $gte: 500 } })

// Prodotti con prezzo minore di 1000
db.prodotti.find({ prezzo: { $lt: 1000 } })

// Prodotti con prezzo minore o uguale a 1000
db.prodotti.find({ prezzo: { $lte: 1000 } })

// Prodotti con prezzo tra 500 e 1000
db.prodotti.find({ 
  prezzo: { 
    $gte: 500, 
    $lte: 1000 
  } 
})
```

### 2.4 In un insieme: `$in` e `$nin`

```javascript
// Prodotti di categoria "Smartphone" o "Tablet"
db.prodotti.find({ 
  categoria: { $in: ["Smartphone", "Tablet"] } 
})

// Prodotti con prezzo 299, 499 o 999
db.prodotti.find({ 
  prezzo: { $in: [299, 499, 999] } 
})

// Prodotti NON di categoria "Accessori" o "Cavi"
db.prodotti.find({ 
  categoria: { $nin: ["Accessori", "Cavi"] } 
})
```

---

## 3. Operatori logici

### 3.1 AND implicito

```javascript
// Prodotti di categoria "Smartphone" E prezzo < 1000
db.prodotti.find({ 
  categoria: "Smartphone", 
  prezzo: { $lt: 1000 } 
})
```

### 3.2 AND esplicito: `$and`

```javascript
db.prodotti.find({
  $and: [
    { categoria: "Smartphone" },
    { prezzo: { $gte: 500 } },
    { disponibile: true }
  ]
})
```

**Quando usare `$and` esplicito:**
- Query con più condizioni sullo stesso campo
- Chiarezza nella query complessa

```javascript
// Query con più condizioni su "prezzo"
db.prodotti.find({
  $and: [
    { prezzo: { $gte: 500 } },
    { prezzo: { $lte: 1500 } }
  ]
})

// Equivalente (più semplice)
db.prodotti.find({ prezzo: { $gte: 500, $lte: 1500 } })
```

### 3.3 OR: `$or`

```javascript
// Prodotti di categoria "Smartphone" O prezzo < 300
db.prodotti.find({
  $or: [
    { categoria: "Smartphone" },
    { prezzo: { $lt: 300 } }
  ]
})

// Prodotti disponibili O in sconto
db.prodotti.find({
  $or: [
    { disponibile: true },
    { sconto: { $gt: 0 } }
  ]
})
```

### 3.4 NOR: `$nor`

```javascript
// Prodotti che NON sono "Smartphone" E NON costano più di 1000
db.prodotti.find({
  $nor: [
    { categoria: "Smartphone" },
    { prezzo: { $gt: 1000 } }
  ]
})
```

### 3.5 NOT: `$not`

```javascript
// Prodotti con prezzo NON maggiore di 500
db.prodotti.find({ 
  prezzo: { $not: { $gt: 500 } } 
})

// Equivalente a:
db.prodotti.find({ prezzo: { $lte: 500 } })
```

### 3.6 Combinazione di operatori logici

```javascript
// (Smartphone O Tablet) E (prezzo < 1000) E disponibile
db.prodotti.find({
  $and: [
    {
      $or: [
        { categoria: "Smartphone" },
        { categoria: "Tablet" }
      ]
    },
    { prezzo: { $lt: 1000 } },
    { disponibile: true }
  ]
})
```

---

## 4. Operatori di esistenza e tipo

### 4.1 Campo esistente: `$exists`

```javascript
// Prodotti che hanno il campo "sconto"
db.prodotti.find({ sconto: { $exists: true } })

// Prodotti senza il campo "garanzia"
db.prodotti.find({ garanzia: { $exists: false } })
```

### 4.2 Tipo di campo: `$type`

```javascript
// Prodotti dove "prezzo" è un numero
db.prodotti.find({ prezzo: { $type: "number" } })

// Prodotti dove "prezzo" è una stringa
db.prodotti.find({ prezzo: { $type: "string" } })

// Tipi comuni
db.prodotti.find({ data: { $type: "date" } })
db.prodotti.find({ tags: { $type: "array" } })
db.prodotti.find({ specifiche: { $type: "object" } })
```

**Tipi BSON supportati:**

| Nome | Numero | Descrizione |
|------|--------|-------------|
| `"double"` | 1 | Numero decimale |
| `"string"` | 2 | Stringa |
| `"object"` | 3 | Oggetto embedded |
| `"array"` | 4 | Array |
| `"binData"` | 5 | Dati binari |
| `"objectId"` | 7 | ObjectId |
| `"bool"` | 8 | Boolean |
| `"date"` | 9 | Data |
| `"null"` | 10 | Null |
| `"int"` | 16 | Intero 32-bit |
| `"long"` | 18 | Intero 64-bit |
| `"decimal"` | 19 | Decimal128 |

---

## 5. Query su array

### 5.1 Array contiene un valore

```javascript
// Prodotti con tag "offerta"
db.prodotti.find({ tags: "offerta" })

// Prodotti con tag "nuovo" o "bestseller"
db.prodotti.find({ tags: { $in: ["nuovo", "bestseller"] } })
```

### 5.2 Array contiene tutti i valori: `$all`

```javascript
// Prodotti con TUTTI i tag: "elettronica", "portatile", "gaming"
db.prodotti.find({ 
  tags: { $all: ["elettronica", "portatile", "gaming"] } 
})
```

### 5.3 Dimensione dell'array: `$size`

```javascript
// Prodotti con esattamente 3 tag
db.prodotti.find({ tags: { $size: 3 } })

// Prodotti senza tag
db.prodotti.find({ tags: { $size: 0 } })
```

**Nota:** `$size` non supporta operatori di confronto. Per array con lunghezza > N, aggiungi un campo contatore.

### 5.4 Elemento nell'array: `$elemMatch`

```javascript
// Trova ordini con almeno un prodotto con quantità > 5
db.ordini.find({
  prodotti: {
    $elemMatch: { quantita: { $gt: 5 } }
  }
})

// Trova ordini con prodotto "Laptop" e prezzo > 1000
db.ordini.find({
  prodotti: {
    $elemMatch: { 
      nome: "Laptop", 
      prezzo: { $gt: 1000 } 
    }
  }
})
```

**Senza `$elemMatch`:**

```javascript
// Questo NON funziona come previsto!
db.ordini.find({
  "prodotti.nome": "Laptop",
  "prodotti.prezzo": { $gt: 1000 }
})
// Trova ordini dove QUALSIASI prodotto si chiama "Laptop"
// E QUALSIASI prodotto (anche diverso) ha prezzo > 1000
```

**Con `$elemMatch`:**

```javascript
// Questo funziona correttamente
db.ordini.find({
  prodotti: {
    $elemMatch: { 
      nome: "Laptop", 
      prezzo: { $gt: 1000 } 
    }
  }
})
// Trova ordini con STESSO prodotto "Laptop" con prezzo > 1000
```

---

## 6. Query su documenti annidati (Dot Notation)

### 6.1 Accesso a campi annidati

```javascript
// Prodotti con specifiche.memoria = "256GB"
db.prodotti.find({ "specifiche.memoria": "256GB" })

// Utenti che abitano a Milano
db.utenti.find({ "indirizzo.citta": "Milano" })

// Ordini con spedizione gratuita
db.ordini.find({ "spedizione.gratuita": true })
```

### 6.2 Livelli multipli di annidamento

```javascript
// Aziende con sede a Roma
db.aziende.find({ "sede.indirizzo.citta": "Roma" })

// Prodotti con coordinate latitudine > 40
db.negozi.find({ "posizione.coordinate.latitudine": { $gt: 40 } })
```

### 6.3 Query su documenti annidati esatti

```javascript
// Trova documenti con indirizzo ESATTAMENTE uguale
db.utenti.find({
  indirizzo: {
    via: "Via Roma 10",
    citta: "Milano",
    cap: "20100"
  }
})
// ⚠️ Deve corrispondere esattamente (campi e ordine)
```

**Meglio usare dot notation:**

```javascript
db.utenti.find({
  "indirizzo.via": "Via Roma 10",
  "indirizzo.citta": "Milano",
  "indirizzo.cap": "20100"
})
// ✅ Più flessibile
```

---

## 7. Proiezioni: selezionare campi specifici

### 7.1 Includere campi

```javascript
// Mostra solo nome e prezzo (e _id di default)
db.prodotti.find({}, { nome: 1, prezzo: 1 })

// Output:
// { "_id": ..., "nome": "iPhone 14", "prezzo": 1199 }
```

### 7.2 Escludere `_id`

```javascript
// Mostra solo nome e prezzo (senza _id)
db.prodotti.find({}, { nome: 1, prezzo: 1, _id: 0 })

// Output:
// { "nome": "iPhone 14", "prezzo": 1199 }
```

### 7.3 Escludere campi

```javascript
// Mostra tutti i campi tranne "descrizione"
db.prodotti.find({}, { descrizione: 0 })

// Escludi più campi
db.prodotti.find({}, { descrizione: 0, specifiche: 0, recensioni: 0 })
```

### 7.4 Proiezioni su campi annidati

```javascript
// Mostra solo nome e città dell'indirizzo
db.utenti.find({}, { nome: 1, "indirizzo.citta": 1, _id: 0 })

// Output:
// { "nome": "Mario", "indirizzo": { "citta": "Milano" } }
```

### 7.5 Slice di array: `$slice`

```javascript
// Mostra solo i primi 3 tag
db.prodotti.find({}, { nome: 1, tags: { $slice: 3 } })

// Mostra gli ultimi 2 commenti
db.articoli.find({}, { titolo: 1, commenti: { $slice: -2 } })

// Salta i primi 5 e prendi i successivi 10
db.articoli.find({}, { commenti: { $slice: [5, 10] } })
```

### 7.6 Elemento corrispondente: `$elemMatch` in proiezione

```javascript
// Mostra solo il primo prodotto con quantità > 5
db.ordini.find(
  {},
  { 
    numero_ordine: 1,
    prodotti: { 
      $elemMatch: { quantita: { $gt: 5 } } 
    } 
  }
)
```

---

## 8. Ordinamento: `sort()`

### 8.1 Ordinamento crescente e decrescente

```javascript
// Ordina per prezzo crescente
db.prodotti.find().sort({ prezzo: 1 })

// Ordina per prezzo decrescente
db.prodotti.find().sort({ prezzo: -1 })

// Ordina per nome alfabetico
db.prodotti.find().sort({ nome: 1 })
```

### 8.2 Ordinamento su più campi

```javascript
// Ordina per categoria (crescente), poi per prezzo (decrescente)
db.prodotti.find().sort({ categoria: 1, prezzo: -1 })

// Ordina per disponibile (decrescente), poi per nome
db.prodotti.find().sort({ disponibile: -1, nome: 1 })
```

### 8.3 Ordinamento su campi annidati

```javascript
// Ordina per città
db.utenti.find().sort({ "indirizzo.citta": 1 })

// Ordina per memoria delle specifiche
db.prodotti.find().sort({ "specifiche.memoria": -1 })
```

---

## 9. Limitare e saltare risultati

### 9.1 Limitare: `limit()`

```javascript
// Mostra solo i primi 5 prodotti
db.prodotti.find().limit(5)

// Primi 10 prodotti più costosi
db.prodotti.find().sort({ prezzo: -1 }).limit(10)
```

### 9.2 Saltare: `skip()`

```javascript
// Salta i primi 10 prodotti
db.prodotti.find().skip(10)

// Salta i primi 20 e mostra i successivi 10
db.prodotti.find().skip(20).limit(10)
```

### 9.3 Paginazione

```javascript
// Pagina 1 (10 prodotti per pagina)
db.prodotti.find().limit(10).skip(0)

// Pagina 2
db.prodotti.find().limit(10).skip(10)

// Pagina 3
db.prodotti.find().limit(10).skip(20)

// Formula generica
const pagina = 3;
const perPagina = 10;
db.prodotti.find()
  .limit(perPagina)
  .skip((pagina - 1) * perPagina)
```

---

## 10. Contare documenti

### 10.1 `countDocuments()`

```javascript
// Conta tutti i prodotti
db.prodotti.countDocuments()

// Conta prodotti disponibili
db.prodotti.countDocuments({ disponibile: true })

// Conta prodotti con prezzo > 500
db.prodotti.countDocuments({ prezzo: { $gt: 500 } })
```

### 10.2 `estimatedDocumentCount()`

```javascript
// Stima veloce del numero totale di documenti
db.prodotti.estimatedDocumentCount()
```

**Differenze:**
- `countDocuments()`: preciso ma più lento (scansiona documenti)
- `estimatedDocumentCount()`: veloce ma approssimativo (usa metadati)

---

## 11. Query avanzate: esempi pratici

### 11.1 E-commerce: prodotti in offerta

```javascript
// Prodotti disponibili, in sconto, prezzo < 500
db.prodotti.find({
  disponibile: true,
  "sconto.attivo": true,
  "sconto.percentuale": { $gte: 20 },
  prezzo: { $lt: 500 }
}).sort({ "sconto.percentuale": -1 })
```

### 11.2 Blog: articoli pubblicati

```javascript
// Articoli pubblicati nell'ultimo mese, ordinati per visualizzazioni
const unMeseFa = new Date();
unMeseFa.setMonth(unMeseFa.getMonth() - 1);

db.articoli.find({
  pubblicato: true,
  data_pubblicazione: { $gte: unMeseFa },
  categoria: { $in: ["Tecnologia", "Programmazione"] }
})
.sort({ visualizzazioni: -1 })
.limit(10)
```

### 11.3 Social network: post recenti

```javascript
// Post pubblici di utenti seguiti, ultimi 20
db.post.find({
  autore_id: { $in: arrayUtentiSeguiti },
  visibilita: "pubblico",
  data_creazione: { $gte: new Date("2026-04-01") }
})
.sort({ data_creazione: -1 })
.limit(20)
.projection({ testo: 1, autore_id: 1, data_creazione: 1, mi_piace: 1 })
```

### 11.4 Sistema di recensioni

```javascript
// Prodotti con valutazione >= 4 stelle e almeno 10 recensioni
db.prodotti.find({
  valutazione_media: { $gte: 4.0 },
  numero_recensioni: { $gte: 10 },
  disponibile: true
})
.sort({ numero_recensioni: -1 })
```

---

## 12. Operatori di valutazione

### 12.1 Modulo: `$mod`

```javascript
// Prodotti con ID pari
db.prodotti.find({ _id: { $mod: [2, 0] } })

// Prodotti con quantità multipla di 5
db.prodotti.find({ quantita: { $mod: [5, 0] } })
```

### 12.2 Espressioni regolari: `$regex`

```javascript
// Prodotti il cui nome contiene "phone" (case-insensitive)
db.prodotti.find({ nome: { $regex: /phone/i } })

// Prodotti che iniziano con "iPhone"
db.prodotti.find({ nome: { $regex: /^iPhone/ } })

// Email che finiscono con "@gmail.com"
db.utenti.find({ email: { $regex: /@gmail\.com$/ } })
```

**Opzioni regex:**
- `i`: case-insensitive
- `m`: multiline
- `x`: ignora spazi bianchi
- `s`: dot (.) include newline

---

## 13. Cursori

### 13.1 Iterare sui risultati

```javascript
// Metodo 1: forEach
db.prodotti.find().forEach(function(doc) {
  print(doc.nome + ": €" + doc.prezzo);
});

// Metodo 2: while con hasNext()
const cursor = db.prodotti.find();
while (cursor.hasNext()) {
  const doc = cursor.next();
  print(doc.nome);
}

// Metodo 3: toArray() (carica tutto in memoria)
const prodotti = db.prodotti.find().toArray();
prodotti.forEach(p => print(p.nome));
```

### 13.2 Informazioni sul cursore

```javascript
const cursor = db.prodotti.find();

// Numero di documenti
cursor.count()

// Verifica se ci sono altri documenti
cursor.hasNext()

// Spiega la query (performance)
cursor.explain("executionStats")
```

---

## 14. Best practices

### 14.1 Performance

✅ **Usa proiezioni**: richiedi solo i campi necessari  
✅ **Limita i risultati**: evita di caricare troppi documenti  
✅ **Crea indici**: su campi usati frequentemente in query  
✅ **Usa `countDocuments()` con parsimonia**: è costoso su collezioni grandi  
✅ **Evita regex complessi**: specialmente senza `^` all'inizio

### 14.2 Query

✅ **Usa operatori specifici**: `$in` invece di tanti `$or`  
✅ **Filtra prima di ordinare**: `find().sort()` invece di `sort().find()`  
✅ **Combina filtri**: usa AND implicito quando possibile  
✅ **Dot notation per annidamenti**: più flessibile di confronto esatto

### 14.3 Manutenibilità

✅ **Commenta query complesse**  
✅ **Usa variabili per filtri riutilizzabili**  
✅ **Testa query con `.limit(1)` prima di eseguirle su tutta la collezione**

---

## 15. Riepilogo comandi

```javascript
// QUERY BASE
db.collezione.find()                          // Tutti i documenti
db.collezione.findOne()                       // Primo documento
db.collezione.find({ campo: valore })         // Con filtro

// OPERATORI CONFRONTO
{ campo: { $eq: valore } }                    // Uguale
{ campo: { $ne: valore } }                    // Diverso
{ campo: { $gt: valore } }                    // Maggiore
{ campo: { $gte: valore } }                   // Maggiore o uguale
{ campo: { $lt: valore } }                    // Minore
{ campo: { $lte: valore } }                   // Minore o uguale
{ campo: { $in: [val1, val2] } }              // In array
{ campo: { $nin: [val1, val2] } }             // Non in array

// OPERATORI LOGICI
{ $and: [ {cond1}, {cond2} ] }                // AND
{ $or: [ {cond1}, {cond2} ] }                 // OR
{ $nor: [ {cond1}, {cond2} ] }                // NOR
{ campo: { $not: {cond} } }                   // NOT

// OPERATORI ARRAY
{ array: valore }                             // Contiene valore
{ array: { $all: [val1, val2] } }             // Contiene tutti
{ array: { $size: n } }                       // Lunghezza array
{ array: { $elemMatch: {cond} } }             // Elemento match

// ALTRI OPERATORI
{ campo: { $exists: true } }                  // Campo esiste
{ campo: { $type: "string" } }                // Tipo campo
{ campo: { $regex: /pattern/i } }             // Regex

// PROIEZIONI
.find({}, { campo1: 1, campo2: 1, _id: 0 })   // Include campi
.find({}, { campo: 0 })                       // Escludi campo

// ORDINAMENTO, LIMIT, SKIP
.sort({ campo: 1 })                           // Ascendente
.sort({ campo: -1 })                          // Discendente
.limit(n)                                     // Limita risultati
.skip(n)                                      // Salta risultati

// CONTARE
.countDocuments()                             // Conta documenti
.estimatedDocumentCount()                     // Stima veloce
```

---

## Riepilogo

In questo capitolo hai imparato:

✅ Come interrogare documenti con `find()` e `findOne()`  
✅ Operatori di confronto (`$gt`, `$lt`, `$in`, ecc.)  
✅ Operatori logici (`$and`, `$or`, `$not`, `$nor`)  
✅ Query su array (`$all`, `$elemMatch`, `$size`)  
✅ Query su documenti annidati (dot notation)  
✅ Proiezioni per selezionare campi specifici  
✅ Ordinamento, limitazione e paginazione  
✅ Contare documenti  
✅ Best practices per performance e manutenibilità

Nel prossimo capitolo, imparerai come **aggiornare** i documenti esistenti con operatori avanzati.

---

## Esercizi

Vai alla cartella [esercizi/](./esercizi/) per mettere in pratica i concetti appresi!
