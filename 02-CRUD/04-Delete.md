# Capitolo 7 — Delete: Eliminare documenti

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Eliminare singoli documenti con `deleteOne()`
- Eliminare più documenti con `deleteMany()`
- Rimuovere completamente collezioni con `drop()`
- Eliminare interi database con `dropDatabase()`
- Comprendere le implicazioni delle operazioni di eliminazione
- Implementare strategie di eliminazione sicure

---

## 1. Eliminare documenti

### 1.1 `deleteOne()` - Eliminare un singolo documento

```javascript
db.collezione.deleteOne({ filtro })
```

**Esempio:**

```javascript
// Elimina il primo prodotto chiamato "iPhone 13"
db.prodotti.deleteOne({ nome: "iPhone 13" })
```

**Output:**

```json
{
  "acknowledged": true,
  "deletedCount": 1
}
```

**Comportamento:**
- Elimina **solo il primo documento** che corrisponde al filtro
- Se più documenti corrispondono, elimina solo il primo (ordinamento interno)

### 1.2 Eliminare per `_id`

```javascript
// Modo più sicuro: eliminare per ID univoco
db.prodotti.deleteOne({ _id: ObjectId("6641f2a3b4c5d6e7f8a9b0c1") })

// Con _id personalizzato
db.utenti.deleteOne({ _id: "user_001" })
```

### 1.3 Eliminare con filtri complessi

```javascript
// Elimina un prodotto non disponibile e con prezzo > 1000
db.prodotti.deleteOne({ 
  disponibile: false,
  prezzo: { $gt: 1000 }
})

// Elimina un articolo non pubblicato da più di 30 giorni
const trentaGiorniFa = new Date();
trentaGiorniFa.setDate(trentaGiorniFa.getDate() - 30);

db.articoli.deleteOne({
  pubblicato: false,
  data_creazione: { $lt: trentaGiorniFa }
})
```

---

## 2. Eliminare più documenti

### 2.1 `deleteMany()` - Eliminare più documenti

```javascript
db.collezione.deleteMany({ filtro })
```

**Esempio:**

```javascript
// Elimina tutti i prodotti non disponibili
db.prodotti.deleteMany({ disponibile: false })
```

**Output:**

```json
{
  "acknowledged": true,
  "deletedCount": 23
}
```

### 2.2 Eliminare per categoria

```javascript
// Elimina tutti gli accessori
db.prodotti.deleteMany({ categoria: "Accessori" })

// Elimina prodotti di più categorie
db.prodotti.deleteMany({ 
  categoria: { $in: ["Obsoleto", "Fuori produzione"] } 
})
```

### 2.3 Eliminare con condizioni numeriche

```javascript
// Elimina prodotti con prezzo < 10
db.prodotti.deleteMany({ prezzo: { $lt: 10 } })

// Elimina prodotti con quantità = 0
db.prodotti.deleteMany({ quantita: 0 })

// Elimina ordini con totale < 5
db.ordini.deleteMany({ totale: { $lt: 5 } })
```

### 2.4 Eliminare con condizioni su date

```javascript
// Elimina log più vecchi di 90 giorni
const novantaGiorniFa = new Date();
novantaGiorniFa.setDate(novantaGiorniFa.getDate() - 90);

db.logs.deleteMany({ 
  data: { $lt: novantaGiorniFa } 
})

// Elimina sessioni scadute
db.sessioni.deleteMany({ 
  scadenza: { $lt: new Date() } 
})
```

### 2.5 ⚠️ Eliminare TUTTI i documenti

```javascript
// ATTENZIONE: elimina TUTTI i documenti della collezione!
db.prodotti.deleteMany({})
```

**⚠️ Pericolo:**
- Filtro vuoto `{}` corrisponde a tutti i documenti
- Usa con estrema cautela
- La collezione rimane, ma vuota

---

## 3. Valori di ritorno

```javascript
const risultato = db.prodotti.deleteOne({ nome: "Test" });
printjson(risultato);
```

**Output:**

```json
{
  "acknowledged": true,
  "deletedCount": 0
}
```

**Campi:**
- `acknowledged`: operazione riconosciuta dal server
- `deletedCount`: numero di documenti eliminati
  - `0`: nessun documento corrispondente
  - `1`: documento eliminato (per `deleteOne()`)
  - `n`: documenti eliminati (per `deleteMany()`)

---

## 4. Verifica prima dell'eliminazione

### 4.1 Conta documenti prima di eliminare

```javascript
// Prima: conta
const count = db.prodotti.countDocuments({ disponibile: false });
print(`Documenti da eliminare: ${count}`);

// Poi: elimina
if (count > 0) {
  db.prodotti.deleteMany({ disponibile: false });
}
```

### 4.2 Visualizza documenti prima di eliminare

```javascript
// Visualizza cosa stai per eliminare
db.prodotti.find({ categoria: "Obsoleto" })

// Se sei sicuro, elimina
db.prodotti.deleteMany({ categoria: "Obsoleto" })
```

### 4.3 Usa `limit()` per test

```javascript
// Test con limite (ma deleteMany non supporta limit direttamente)
// Soluzione: trova gli ID, poi elimina
const ids = db.prodotti.find({ categoria: "Test" })
  .limit(5)
  .map(doc => doc._id);

db.prodotti.deleteMany({ _id: { $in: ids } });
```

---

## 5. Eliminare con operatori avanzati

### 5.1 Eliminare con `$or`

```javascript
// Elimina prodotti obsoleti O senza stock
db.prodotti.deleteMany({
  $or: [
    { categoria: "Obsoleto" },
    { quantita: 0 }
  ]
})
```

### 5.2 Eliminare con `$and`

```javascript
// Elimina ordini annullati E vecchi
const seimesiFa = new Date();
seimesiFa.setMonth(seimesiFa.getMonth() - 6);

db.ordini.deleteMany({
  $and: [
    { stato: "annullato" },
    { data: { $lt: seimesiFa } }
  ]
})
```

### 5.3 Eliminare documenti con campi assenti

```javascript
// Elimina prodotti senza descrizione
db.prodotti.deleteMany({ 
  descrizione: { $exists: false } 
})

// Elimina utenti senza email verificata
db.utenti.deleteMany({ 
  email_verificata: { $exists: false } 
})
```

### 5.4 Eliminare con regex

```javascript
// Elimina prodotti con nome che contiene "test"
db.prodotti.deleteMany({ 
  nome: { $regex: /test/i } 
})

// Elimina email spam (dominio temporaneo)
db.email.deleteMany({ 
  mittente: { $regex: /@tempmail\.(com|net|org)$/i } 
})
```

---

## 6. Eliminare documenti annidati e array

### 6.1 Eliminare per campo annidato

```javascript
// Elimina utenti che abitano a Milano
db.utenti.deleteMany({ 
  "indirizzo.citta": "Milano" 
})

// Elimina prodotti con specifiche.ram < 4GB
db.prodotti.deleteMany({ 
  "specifiche.ram": { $lt: 4 } 
})
```

### 6.2 Eliminare per elementi in array

```javascript
// Elimina prodotti con tag "obsoleto"
db.prodotti.deleteMany({ 
  tags: "obsoleto" 
})

// Elimina articoli con categoria in lista
db.articoli.deleteMany({ 
  categorie: { $in: ["spam", "test", "draft"] } 
})
```

---

## 7. Eliminare collezioni

### 7.1 `drop()` - Eliminare una collezione

```javascript
// Elimina la collezione "prodotti_test"
db.prodotti_test.drop()
```

**Output:**

```
true
```

**Comportamento:**
- Elimina la collezione e tutti i suoi documenti
- Elimina anche tutti gli indici associati
- Più veloce di `deleteMany({})`
- Restituisce `true` se la collezione esisteva, `false` altrimenti

### 7.2 Differenza tra `drop()` e `deleteMany({})`

| Operazione | `deleteMany({})` | `drop()` |
|------------|------------------|----------|
| Elimina documenti | ✅ Sì | ✅ Sì |
| Elimina collezione | ❌ No (rimane vuota) | ✅ Sì |
| Elimina indici | ❌ No | ✅ Sì |
| Velocità | Lenta (documenti singoli) | Veloce |
| Reversibile | Solo con backup | Solo con backup |

### 7.3 Verifica esistenza collezione

```javascript
// Lista collezioni
show collections

// Verifica se collezione esiste
const collezioni = db.getCollectionNames();
if (collezioni.includes("prodotti_test")) {
  db.prodotti_test.drop();
  print("Collezione eliminata");
} else {
  print("Collezione non trovata");
}
```

---

## 8. Eliminare database

### 8.1 `dropDatabase()` - Eliminare un database

```javascript
// Seleziona il database
use test_database

// Verifica di essere nel database giusto
db

// Elimina il database corrente
db.dropDatabase()
```

**Output:**

```json
{
  "ok": 1,
  "dropped": "test_database"
}
```

**⚠️ ATTENZIONE:**
- Elimina TUTTO il database e tutte le collezioni
- Operazione irreversibile (senza backup)
- Non è possibile eliminare i database di sistema: `admin`, `local`, `config`

### 8.2 Verifica prima di eliminare

```javascript
// Mostra database corrente
db

// Mostra tutte le collezioni
show collections

// Mostra dimensione database
db.stats()

// Se sei ASSOLUTAMENTE sicuro
db.dropDatabase()
```

---

## 9. Operazioni di eliminazione sicure

### 9.1 Backup prima di eliminare

```bash
# Backup di una collezione (da terminale)
mongoexport --db=mio_db --collection=prodotti --out=prodotti_backup.json

# Backup di un database completo
mongodump --db=mio_db --out=/backup/

# Backup di tutto il server
mongodump --out=/backup/full/
```

### 9.2 Conferma utente (in applicazione)

```javascript
// Esempio in Node.js/JavaScript applicazione
function eliminaProdotto(id) {
  const conferma = confirm("Sei sicuro di voler eliminare questo prodotto?");
  
  if (conferma) {
    const risultato = db.prodotti.deleteOne({ _id: ObjectId(id) });
    
    if (risultato.deletedCount === 1) {
      console.log("Prodotto eliminato");
    } else {
      console.log("Prodotto non trovato");
    }
  }
}
```

### 9.3 Soft delete (eliminazione logica)

Invece di eliminare fisicamente, marca come "eliminato":

```javascript
// Soft delete: marca come eliminato
db.prodotti.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      eliminato: true,
      data_eliminazione: new Date()
    } 
  }
)

// Query che escludono documenti eliminati
db.prodotti.find({ 
  eliminato: { $ne: true } 
})

// Eliminazione definitiva (pulizia periodica)
const seimesiFa = new Date();
seimesiFa.setMonth(seimesiFa.getMonth() - 6);

db.prodotti.deleteMany({
  eliminato: true,
  data_eliminazione: { $lt: seimesiFa }
})
```

**Vantaggi del soft delete:**
✅ Possibilità di ripristino  
✅ Storico delle eliminazioni  
✅ Audit e compliance  
✅ Annullamento errori utente

**Svantaggi:**
❌ Database più grande  
❌ Query più complesse (sempre filtrare `eliminato`)  
❌ Serve pulizia periodica

---

## 10. Gestione errori

### 10.1 Controllo risultato eliminazione

```javascript
const risultato = db.prodotti.deleteOne({ _id: ObjectId("...") });

if (risultato.deletedCount === 0) {
  print("Errore: documento non trovato");
} else {
  print("Documento eliminato con successo");
}
```

### 10.2 Try-catch per errori

```javascript
try {
  const risultato = db.prodotti.deleteMany({ categoria: "Test" });
  print(`Eliminati ${risultato.deletedCount} documenti`);
} catch (error) {
  print("Errore durante l'eliminazione: " + error.message);
}
```

### 10.3 Validazione prima dell'eliminazione

```javascript
function eliminaProddottoSicuro(id) {
  // Verifica che l'ID sia valido
  if (!ObjectId.isValid(id)) {
    throw new Error("ID non valido");
  }
  
  // Verifica che il prodotto esista
  const prodotto = db.prodotti.findOne({ _id: ObjectId(id) });
  if (!prodotto) {
    throw new Error("Prodotto non trovato");
  }
  
  // Verifica che non ci siano ordini associati
  const ordini = db.ordini.countDocuments({ 
    "prodotti.id": ObjectId(id) 
  });
  if (ordini > 0) {
    throw new Error("Impossibile eliminare: prodotto presente in ordini");
  }
  
  // Elimina
  return db.prodotti.deleteOne({ _id: ObjectId(id) });
}
```

---

## 11. Esempi pratici

### 11.1 Pulizia periodica dei log

```javascript
// Elimina log più vecchi di 30 giorni
const trentaGiorniFa = new Date();
trentaGiorniFa.setDate(trentaGiorniFa.getDate() - 30);

const risultato = db.logs.deleteMany({ 
  timestamp: { $lt: trentaGiorniFa },
  livello: { $in: ["DEBUG", "INFO"] }
});

print(`Eliminati ${risultato.deletedCount} log`);
```

### 11.2 Eliminazione utenti inattivi

```javascript
// Elimina utenti non verificati dopo 7 giorni
const setteGiorniFa = new Date();
setteGiorniFa.setDate(setteGiorniFa.getDate() - 7);

db.utenti.deleteMany({
  email_verificata: false,
  data_registrazione: { $lt: setteGiorniFa }
});
```

### 11.3 Pulizia carrelli abbandonati

```javascript
// Elimina carrelli abbandonati da più di 24 ore
const ventiquattroOreFa = new Date();
ventiquattroOreFa.setHours(ventiquattroOreFa.getHours() - 24);

db.carrelli.deleteMany({
  stato: "abbandonato",
  ultima_modifica: { $lt: ventiquattroOreFa }
});
```

### 11.4 Eliminazione sessioni scadute

```javascript
// Elimina sessioni scadute
db.sessioni.deleteMany({ 
  scadenza: { $lt: new Date() } 
});
```

### 11.5 Pulizia dati di test

```javascript
// Elimina tutti i dati di test
db.utenti.deleteMany({ email: { $regex: /test@example\.com/ } });
db.prodotti.deleteMany({ nome: { $regex: /^test_/i } });
db.ordini.deleteMany({ note: "test" });
```

---

## 12. Indici TTL (Time To Live)

Gli **indici TTL** eliminano automaticamente documenti dopo un certo periodo.

### 12.1 Creare indice TTL

```javascript
// I documenti vengono eliminati dopo 30 giorni dalla data in "created_at"
db.sessioni.createIndex(
  { created_at: 1 }, 
  { expireAfterSeconds: 2592000 }  // 30 giorni = 30 * 24 * 60 * 60
)

// Elimina dopo 24 ore
db.log_temporanei.createIndex(
  { timestamp: 1 }, 
  { expireAfterSeconds: 86400 }  // 24 ore
)
```

### 12.2 Vantaggi degli indici TTL

✅ Eliminazione automatica (nessuno script necessario)  
✅ Non richiede manutenzione manuale  
✅ Efficiente (MongoDB gestisce internamente)  
✅ Utile per dati temporanei (sessioni, cache, log)

### 12.3 Limitazioni

❌ Funziona solo con campi di tipo `Date`  
❌ Un solo indice TTL per collezione  
❌ Controllo ogni 60 secondi (non istantaneo)

---

## 13. Best practices

### 13.1 Sicurezza

✅ **Sempre backup prima di eliminazioni massive**  
✅ **Verifica il filtro con `find()` prima di `delete()`**  
✅ **Usa `deleteOne()` quando possibile** (più sicuro)  
✅ **Limita permessi di eliminazione** (solo admin)  
✅ **Log delle eliminazioni** per audit

### 13.2 Performance

✅ **Usa indici sui campi del filtro**  
✅ **Elimina in batch** per grandi quantità  
✅ **Considera `drop()` invece di `deleteMany({})` per svuotare**  
✅ **Pianifica eliminazioni in orari di basso carico**

### 13.3 Gestione dati

✅ **Preferisci soft delete per dati importanti**  
✅ **Usa indici TTL per dati temporanei**  
✅ **Archivia prima di eliminare** (se necessario)  
✅ **Documenta politiche di retention**

---

## 14. Checklist eliminazione sicura

Prima di eliminare dati importanti:

- [ ] Ho fatto un backup?
- [ ] Ho testato il filtro con `find()`?
- [ ] Ho contato i documenti con `countDocuments()`?
- [ ] Sono nel database corretto?
- [ ] Ho verificato le dipendenze (riferimenti)?
- [ ] Ho i permessi necessari?
- [ ] Ho informato gli stakeholder?
- [ ] Posso usare soft delete invece?
- [ ] Ho un piano di rollback?

---

## 15. Riepilogo comandi

```javascript
// ELIMINARE DOCUMENTI
db.collezione.deleteOne({ filtro })          // Elimina un documento
db.collezione.deleteMany({ filtro })         // Elimina più documenti
db.collezione.deleteMany({})                 // Elimina tutti i documenti

// ELIMINARE COLLEZIONI
db.collezione.drop()                         // Elimina collezione

// ELIMINARE DATABASE
use database
db.dropDatabase()                            // Elimina database corrente

// VERIFICA
db.collezione.find({ filtro })               // Verifica prima
db.collezione.countDocuments({ filtro })     // Conta prima

// SOFT DELETE
db.collezione.updateOne(
  { _id: ... },
  { $set: { eliminato: true } }
)

// INDICE TTL
db.collezione.createIndex(
  { data: 1 }, 
  { expireAfterSeconds: 86400 }
)
```

---

## Riepilogo

In questo capitolo hai imparato:

✅ Come eliminare documenti con `deleteOne()` e `deleteMany()`  
✅ Come eliminare collezioni con `drop()`  
✅ Come eliminare database con `dropDatabase()`  
✅ Strategie di eliminazione sicura (backup, verifica, conferma)  
✅ Soft delete come alternativa all'eliminazione fisica  
✅ Indici TTL per eliminazione automatica  
✅ Best practices per eliminazioni sicure ed efficienti  
✅ Gestione errori e validazione

Hai completato il **Modulo 2 - CRUD**! Nel prossimo modulo, esplorerai **query avanzate** per interrogazioni complesse su documenti annidati, array e aggregazioni.

---

## Esercizi

Vai alla cartella [esercizi/](./esercizi/) per mettere in pratica i concetti appresi!
