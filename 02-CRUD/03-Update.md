# Capitolo 6 — Update: Aggiornare documenti

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Aggiornare documenti con `updateOne()` e `updateMany()`
- Usare operatori di aggiornamento (`$set`, `$unset`, `$inc`, ecc.)
- Modificare array con operatori specifici
- Sostituire documenti con `replaceOne()`
- Usare `upsert` per inserire o aggiornare
- Gestire aggiornamenti su documenti annidati

---

## 1. Operazioni di aggiornamento base

### 1.1 `updateOne()` - Aggiornare un documento

```javascript
db.collezione.updateOne(
  { filtro },           // Quale documento aggiornare
  { operazione },       // Come aggiornarlo
  { opzioni }           // Opzioni (facoltativo)
)
```

**Esempio:**

```javascript
db.prodotti.updateOne(
  { nome: "iPhone 14 Pro" },
  { $set: { prezzo: 1099.99 } }
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

### 1.2 `updateMany()` - Aggiornare più documenti

```javascript
// Aumenta del 10% il prezzo di tutti gli smartphone
db.prodotti.updateMany(
  { categoria: "Smartphone" },
  { $mul: { prezzo: 1.1 } }
)
```

**Output:**

```json
{
  "acknowledged": true,
  "matchedCount": 15,
  "modifiedCount": 15
}
```

### 1.3 Valori di ritorno

- `acknowledged`: operazione riconosciuta dal server
- `matchedCount`: documenti che corrispondono al filtro
- `modifiedCount`: documenti effettivamente modificati
- `upsertedId`: `_id` del documento inserito (solo con upsert)

---

## 2. Operatore `$set`: impostare campi

### 2.1 Impostare un campo

```javascript
// Aggiorna il prezzo
db.prodotti.updateOne(
  { _id: ObjectId("...") },
  { $set: { prezzo: 899.99 } }
)

// Imposta disponibilità
db.prodotti.updateOne(
  { nome: "iPad Air" },
  { $set: { disponibile: true } }
)
```

### 2.2 Impostare più campi

```javascript
db.prodotti.updateOne(
  { nome: "MacBook Pro" },
  { 
    $set: { 
      prezzo: 2299.99,
      disponibile: true,
      quantita: 25,
      data_aggiornamento: new Date()
    } 
  }
)
```

### 2.3 Creare nuovi campi

```javascript
// Aggiunge il campo "sconto" se non esiste
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { $set: { sconto: 10 } }
)
```

### 2.4 Aggiornare campi annidati

```javascript
// Aggiorna la città nell'indirizzo
db.utenti.updateOne(
  { nome: "Mario" },
  { $set: { "indirizzo.citta": "Roma" } }
)

// Aggiorna specifiche del prodotto
db.prodotti.updateOne(
  { nome: "Laptop" },
  { 
    $set: { 
      "specifiche.ram": "32GB",
      "specifiche.storage": "1TB SSD"
    } 
  }
)
```

### 2.5 Sostituire un documento annidato completo

```javascript
db.utenti.updateOne(
  { nome: "Mario" },
  { 
    $set: { 
      indirizzo: {
        via: "Via Nuova 5",
        citta: "Milano",
        cap: "20100"
      }
    } 
  }
)
```

---

## 3. Operatore `$unset`: rimuovere campi

```javascript
// Rimuovi il campo "sconto"
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { $unset: { sconto: "" } }
)

// Rimuovi più campi
db.prodotti.updateOne(
  { nome: "iPad" },
  { $unset: { sconto: "", garanzia_estesa: "" } }
)

// Rimuovi campo annidato
db.utenti.updateOne(
  { nome: "Mario" },
  { $unset: { "indirizzo.cap": "" } }
)
```

**Nota:** Il valore dopo il campo (`""`) viene ignorato; puoi usare qualsiasi valore.

---

## 4. Operatori numerici

### 4.1 `$inc`: incrementare/decrementare

```javascript
// Incrementa il prezzo di 50
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { $inc: { prezzo: 50 } }
)

// Decrementa la quantità di 5
db.prodotti.updateOne(
  { nome: "iPad" },
  { $inc: { quantita: -5 } }
)

// Incrementa visualizzazioni e likes
db.articoli.updateOne(
  { _id: ObjectId("...") },
  { 
    $inc: { 
      visualizzazioni: 1,
      likes: 1
    } 
  }
)
```

**Comportamento:**
- Se il campo non esiste, viene creato con valore 0 + incremento
- Funziona solo con numeri

### 4.2 `$mul`: moltiplicare

```javascript
// Aumenta tutti i prezzi del 10% (moltiplica per 1.1)
db.prodotti.updateMany(
  { categoria: "Elettronica" },
  { $mul: { prezzo: 1.1 } }
)

// Dimezza il prezzo
db.prodotti.updateOne(
  { nome: "Prodotto in saldo" },
  { $mul: { prezzo: 0.5 } }
)
```

### 4.3 `$min` e `$max`: valore minimo/massimo

```javascript
// Imposta prezzo a 999 solo se è maggiore
db.prodotti.updateOne(
  { nome: "iPhone" },
  { $min: { prezzo: 999 } }
)

// Imposta quantità a 100 solo se è minore
db.prodotti.updateOne(
  { nome: "iPad" },
  { $max: { quantita: 100 } }
)
```

**Uso tipico:** limitare valori entro un range.

---

## 5. Operatori per array

### 5.1 `$push`: aggiungere elemento a un array

```javascript
// Aggiungi un tag
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { $push: { tags: "bestseller" } }
)

// Aggiungi un commento
db.articoli.updateOne(
  { _id: ObjectId("...") },
  { 
    $push: { 
      commenti: {
        utente: "Mario",
        testo: "Ottimo articolo!",
        data: new Date()
      }
    } 
  }
)
```

### 5.2 `$push` con `$each`: aggiungere più elementi

```javascript
// Aggiungi più tag
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { 
    $push: { 
      tags: { 
        $each: ["nuovo", "5G", "offerta"] 
      } 
    } 
  }
)
```

### 5.3 `$push` con `$position`: inserire in posizione specifica

```javascript
// Inserisci tag all'inizio dell'array
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { 
    $push: { 
      tags: { 
        $each: ["importante"],
        $position: 0 
      } 
    } 
  }
)
```

### 5.4 `$push` con `$slice`: limitare la dimensione dell'array

```javascript
// Mantieni solo gli ultimi 10 commenti
db.articoli.updateOne(
  { _id: ObjectId("...") },
  { 
    $push: { 
      commenti: { 
        $each: [nuovoCommento],
        $slice: -10  // Mantieni ultimi 10
      } 
    } 
  }
)
```

### 5.5 `$push` con `$sort`: ordinare l'array

```javascript
// Aggiungi e ordina per data
db.articoli.updateOne(
  { _id: ObjectId("...") },
  { 
    $push: { 
      commenti: { 
        $each: [nuovoCommento],
        $sort: { data: -1 },  // Ordina per data decrescente
        $slice: 10            // Mantieni primi 10
      } 
    } 
  }
)
```

### 5.6 `$addToSet`: aggiungere solo se non presente

```javascript
// Aggiungi tag solo se non esiste già
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { $addToSet: { tags: "nuovo" } }
)

// Aggiungi più elementi univoci
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { 
    $addToSet: { 
      tags: { 
        $each: ["offerta", "bestseller", "5G"] 
      } 
    } 
  }
)
```

### 5.7 `$pop`: rimuovere primo o ultimo elemento

```javascript
// Rimuovi ultimo elemento
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { $pop: { tags: 1 } }
)

// Rimuovi primo elemento
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { $pop: { tags: -1 } }
)
```

### 5.8 `$pull`: rimuovere elementi che corrispondono

```javascript
// Rimuovi il tag "offerta"
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { $pull: { tags: "offerta" } }
)

// Rimuovi tutti i tag che contengono numeri
db.prodotti.updateMany(
  {},
  { $pull: { tags: { $regex: /\d/ } } }
)

// Rimuovi commenti di un utente specifico
db.articoli.updateOne(
  { _id: ObjectId("...") },
  { $pull: { commenti: { utente: "Spam" } } }
)
```

### 5.9 `$pullAll`: rimuovere più valori specifici

```javascript
// Rimuovi più tag
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { $pullAll: { tags: ["vecchio", "obsoleto", "fuori-produzione"] } }
)
```

---

## 6. Operatore posizionale `$`

### 6.1 Aggiornare elemento nell'array

```javascript
// Aggiorna il prezzo del primo prodotto chiamato "Laptop"
db.ordini.updateOne(
  { "prodotti.nome": "Laptop" },
  { $set: { "prodotti.$.prezzo": 1199.99 } }
)
```

**Nota:** `$` rappresenta il primo elemento che corrisponde al filtro.

### 6.2 Incrementare valore nell'array

```javascript
// Incrementa quantità del primo prodotto con ID specifico
db.ordini.updateOne(
  { "prodotti.id": 123 },
  { $inc: { "prodotti.$.quantita": 1 } }
)
```

### 6.3 `$[]`: aggiornare tutti gli elementi dell'array

```javascript
// Aggiungi sconto a tutti i prodotti
db.ordini.updateOne(
  { numero_ordine: "ORD-001" },
  { $set: { "prodotti.$[].sconto": 10 } }
)
```

### 6.4 `$[<identifier>]`: aggiornare elementi filtrati

```javascript
// Applica sconto solo ai prodotti con prezzo > 1000
db.ordini.updateOne(
  { numero_ordine: "ORD-001" },
  { $set: { "prodotti.$[elem].sconto": 15 } },
  { 
    arrayFilters: [{ "elem.prezzo": { $gt: 1000 } }] 
  }
)

// Marca come letti i commenti di un utente
db.articoli.updateOne(
  { _id: ObjectId("...") },
  { $set: { "commenti.$[comm].letto": true } },
  { 
    arrayFilters: [{ "comm.utente": "Mario" }] 
  }
)
```

---

## 7. `replaceOne()`: sostituire un documento

```javascript
// Sostituisce COMPLETAMENTE il documento
db.prodotti.replaceOne(
  { nome: "iPhone 13" },
  {
    nome: "iPhone 14 Pro",
    prezzo: 1199.99,
    categoria: "Smartphone",
    disponibile: true
  }
)
```

**⚠️ Attenzione:**
- Sostituisce tutto il documento (tranne `_id`)
- Non usa operatori come `$set`
- Tutti i campi precedenti vengono persi

**Quando usare `replaceOne()`:**
- Ricostruire completamente un documento
- Migrazioni di schema

**Meglio usare `updateOne()` con `$set` per aggiornamenti parziali.**

---

## 8. Upsert: inserire o aggiornare

### 8.1 Concetto di upsert

**Upsert** = **Up**date + In**sert**

Se il documento esiste, lo aggiorna; altrimenti, lo inserisce.

```javascript
db.prodotti.updateOne(
  { nome: "Prodotto Nuovo" },
  { 
    $set: { 
      prezzo: 99.99,
      categoria: "Accessori",
      disponibile: true
    } 
  },
  { upsert: true }
)
```

**Comportamento:**
- Se esiste un prodotto con nome "Prodotto Nuovo": lo aggiorna
- Se non esiste: lo crea con i campi specificati

### 8.2 Esempio pratico: contatore visualizzazioni

```javascript
// Incrementa visualizzazioni o crea documento se non esiste
db.statistiche.updateOne(
  { pagina: "/prodotti" },
  { 
    $inc: { visualizzazioni: 1 },
    $setOnInsert: { 
      data_creazione: new Date(),
      tipo: "pagina"
    }
  },
  { upsert: true }
)
```

### 8.3 `$setOnInsert`: imposta solo al momento dell'inserimento

```javascript
db.utenti.updateOne(
  { email: "mario@example.com" },
  { 
    $set: { ultimo_accesso: new Date() },
    $setOnInsert: { 
      data_registrazione: new Date(),
      ruolo: "utente"
    }
  },
  { upsert: true }
)
```

**Comportamento:**
- `$set`: viene sempre applicato (update o insert)
- `$setOnInsert`: applicato solo in caso di insert

---

## 9. `$currentDate`: timestamp automatico

```javascript
// Imposta data di ultima modifica
db.prodotti.updateOne(
  { nome: "iPhone 14" },
  { 
    $set: { prezzo: 1099.99 },
    $currentDate: { 
      ultima_modifica: true,           // Timestamp
      data_aggiornamento: { $type: "date" }  // Date
    }
  }
)
```

**Tipi supportati:**
- `true` o `{ $type: "timestamp" }`: timestamp BSON
- `{ $type: "date" }`: oggetto Date

---

## 10. `$rename`: rinominare campi

```javascript
// Rinomina campo "prezzo" in "prezzo_listino"
db.prodotti.updateMany(
  {},
  { $rename: { "prezzo": "prezzo_listino" } }
)

// Rinomina più campi
db.utenti.updateMany(
  {},
  { 
    $rename: { 
      "nome_completo": "nome",
      "mail": "email"
    } 
  }
)

// Rinomina campo annidato
db.prodotti.updateMany(
  {},
  { $rename: { "specifiche.cpu": "specifiche.processore" } }
)
```

---

## 11. Esempi pratici completi

### 11.1 E-commerce: aggiornamento prodotto

```javascript
// Aggiorna prodotto con nuove info
db.prodotti.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      prezzo: 1099.99,
      disponibile: true,
      quantita: 50,
      "specifiche.memoria": "512GB"
    },
    $push: { 
      tags: { 
        $each: ["offerta", "nuovo"],
        $position: 0
      }
    },
    $inc: { numero_aggiornamenti: 1 },
    $currentDate: { ultima_modifica: true }
  }
)
```

### 11.2 Blog: gestione commenti

```javascript
// Aggiungi commento e aggiorna contatori
db.articoli.updateOne(
  { _id: ObjectId("...") },
  { 
    $push: { 
      commenti: {
        _id: ObjectId(),
        utente: "Mario",
        testo: "Ottimo articolo!",
        data: new Date(),
        likes: 0
      }
    },
    $inc: { numero_commenti: 1 },
    $currentDate: { ultima_attivita: true }
  }
)

// Incrementa likes di un commento specifico
db.articoli.updateOne(
  { 
    _id: ObjectId("..."),
    "commenti._id": ObjectId("...")
  },
  { $inc: { "commenti.$.likes": 1 } }
)
```

### 11.3 Social network: gestione amicizie

```javascript
// Aggiungi amico (bidirezionale)
const user1 = ObjectId("...");
const user2 = ObjectId("...");

// Utente 1
db.utenti.updateOne(
  { _id: user1 },
  { 
    $addToSet: { amici: user2 },
    $inc: { numero_amici: 1 }
  }
);

// Utente 2
db.utenti.updateOne(
  { _id: user2 },
  { 
    $addToSet: { amici: user1 },
    $inc: { numero_amici: 1 }
  }
);
```

### 11.4 Sistema di voti

```javascript
// Aggiungi voto a prodotto
db.prodotti.updateOne(
  { _id: ObjectId("...") },
  { 
    $push: { voti: 5 },
    $inc: { numero_voti: 1, somma_voti: 5 }
  }
);

// Ricalcola media
db.prodotti.updateOne(
  { _id: ObjectId("...") },
  [
    {
      $set: {
        valutazione_media: {
          $divide: ["$somma_voti", "$numero_voti"]
        }
      }
    }
  ]
);
```

---

## 12. Aggiornamenti con aggregation pipeline

Da MongoDB 4.2, puoi usare aggregation pipeline in `updateOne/updateMany`:

```javascript
// Incrementa prezzo del 10% usando il valore attuale
db.prodotti.updateMany(
  { categoria: "Elettronica" },
  [
    { 
      $set: { 
        prezzo: { $multiply: ["$prezzo", 1.1] },
        prezzo_vecchio: "$prezzo"
      } 
    }
  ]
)

// Crea campo calcolato
db.ordini.updateMany(
  {},
  [
    {
      $set: {
        totale: {
          $sum: "$prodotti.prezzo"
        }
      }
    }
  ]
)
```

---

## 13. Best practices

### 13.1 Performance

✅ **Usa indici sui campi del filtro**  
✅ **Preferisci `updateOne()` a `updateMany()` quando possibile**  
✅ **Batch updates**: raggruppa aggiornamenti simili  
✅ **Evita aggiornamenti che ricostruiscono interi array**

### 13.2 Sicurezza

✅ **Valida i dati prima dell'aggiornamento**  
✅ **Usa `$setOnInsert` per campi immutabili**  
✅ **Gestisci errori con try-catch**  
✅ **Limita i permessi di scrittura**

### 13.3 Manutenibilità

✅ **Usa `$currentDate` per tracking modifiche**  
✅ **Mantieni uno storico delle modifiche se necessario**  
✅ **Documenta logica di business complessa**  
✅ **Testa aggiornamenti su copie dei dati**

---

## 14. Riepilogo operatori

```javascript
// IMPOSTARE/RIMUOVERE
$set                    // Imposta campi
$unset                  // Rimuove campi
$setOnInsert            // Imposta solo in insert (con upsert)
$rename                 // Rinomina campi

// NUMERICI
$inc                    // Incrementa/decrementa
$mul                    // Moltiplica
$min                    // Imposta minimo
$max                    // Imposta massimo

// ARRAY - AGGIUNGERE
$push                   // Aggiungi elemento
$push + $each           // Aggiungi più elementi
$push + $position       // Inserisci in posizione
$push + $slice          // Limita dimensione
$push + $sort           // Ordina array
$addToSet               // Aggiungi solo se unico

// ARRAY - RIMUOVERE
$pop                    // Rimuovi primo/ultimo
$pull                   // Rimuovi per condizione
$pullAll                // Rimuovi valori specifici

// ARRAY - AGGIORNARE
$                       // Primo elemento match
$[]                     // Tutti gli elementi
$[<id>]                 // Elementi filtrati

// ALTRO
$currentDate            // Timestamp automatico
```

---

## Riepilogo

In questo capitolo hai imparato:

✅ Come aggiornare documenti con `updateOne()` e `updateMany()`  
✅ Operatori di aggiornamento per campi (`$set`, `$unset`, `$inc`)  
✅ Operatori per manipolare array (`$push`, `$pull`, `$addToSet`)  
✅ Operatore posizionale per aggiornare elementi specifici  
✅ Come sostituire documenti con `replaceOne()`  
✅ Upsert per inserire o aggiornare  
✅ Best practices per aggiornamenti efficaci e sicuri

Nel prossimo capitolo, imparerai come **eliminare** documenti e collezioni in modo sicuro.

---

## Esercizi

Vai alla cartella [esercizi/](./esercizi/) per mettere in pratica i concetti appresi!
