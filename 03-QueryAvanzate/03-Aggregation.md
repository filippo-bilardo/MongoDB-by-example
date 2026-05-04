# Capitolo 10 — Aggregation Pipeline

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Comprendere il concetto di pipeline di aggregazione
- Usare gli stage principali: `$match`, `$group`, `$project`, `$sort`, `$limit`
- Applicare operatori di raggruppamento: `$sum`, `$avg`, `$min`, `$max`
- Implementare join con `$lookup`
- Trasformare array con `$unwind`
- Creare pipeline complesse multi-stage per analisi dati

---

## 1. Introduzione all'Aggregation Pipeline

### 1.1 Cos'è l'Aggregation Framework?

L'**aggregation framework** permette di:
- **Trasformare** e **analizzare** dati
- Eseguire operazioni **multi-stage** (pipeline)
- Calcolare **statistiche** e **metriche**
- Fare **join** tra collezioni
- **Raggruppare** e **aggregare** valori

### 1.2 Concetto di Pipeline

Una pipeline è una **sequenza di stage** dove l'output di uno stage diventa l'input del successivo:

```
Documenti → Stage 1 → Stage 2 → Stage 3 → Risultato
```

**Esempio visivo:**

```javascript
db.ordini.aggregate([
  { $match: { stato: "completato" } },     // Stage 1: Filtra
  { $group: { _id: "$cliente", tot: { $sum: "$importo" } } },  // Stage 2: Raggruppa
  { $sort: { tot: -1 } }                   // Stage 3: Ordina
])
```

**Flusso:**

1. **Input:** Tutti i documenti della collezione `ordini`
2. **Stage 1 ($match):** Filtra solo ordini completati → 1000 documenti
3. **Stage 2 ($group):** Raggruppa per cliente e somma importi → 50 clienti
4. **Stage 3 ($sort):** Ordina per totale decrescente → 50 clienti ordinati
5. **Output:** Top clienti per spesa

---

## 2. Stage Fondamentali

### 2.1 Stage `$match`: Filtrare Documenti

Equivale a `find()` - seleziona solo i documenti che matchano le condizioni.

**Sintassi:**

```javascript
{ $match: { campo: valore } }
```

**Esempi:**

```javascript
// Filtra ordini del 2024
db.ordini.aggregate([
  { $match: { anno: 2024 } }
])

// Filtra prodotti costosi
db.prodotti.aggregate([
  { $match: { prezzo: { $gte: 100 } } }
])

// Combina condizioni
db.utenti.aggregate([
  { $match: { 
      età: { $gte: 18 },
      verificato: true
  }}
])
```

**Best practice:** Metti `$match` **all'inizio** della pipeline per ridurre documenti da processare!

### 2.2 Stage `$project`: Selezionare e Trasformare Campi

Equivale a proiezione in `find()` - seleziona, rinomina, calcola campi.

**Sintassi:**

```javascript
{ $project: { 
    campo1: 1,           // Includi
    campo2: 0,           // Escludi
    nuovoCampo: "$vecchioCampo",  // Rinomina
    calcolato: { $add: ["$campo3", 10] }  // Calcola
}}
```

**Esempi:**

```javascript
// Solo nome e email
db.utenti.aggregate([
  { $project: { nome: 1, email: 1 } }
])

// Rinomina campo
db.prodotti.aggregate([
  { $project: { 
      nomeProdotto: "$nome",
      costoEuro: "$prezzo"
  }}
])

// Calcola campo
db.ordini.aggregate([
  { $project: { 
      cliente: 1,
      totale: 1,
      totaleConIVA: { $multiply: ["$totale", 1.22] }
  }}
])

// Estrai anno da data
db.eventi.aggregate([
  { $project: { 
      nome: 1,
      anno: { $year: "$dataEvento" }
  }}
])
```

### 2.3 Stage `$group`: Raggruppare e Aggregare

Raggruppa documenti per un campo e applica operatori di aggregazione.

**Sintassi:**

```javascript
{ $group: {
    _id: "$campoRaggruppamento",  // Campo per cui raggruppare
    nomeCampoCalcolato: { $operatore: "$campo" }
}}
```

**Operatori principali:**

| Operatore | Descrizione | Esempio |
|-----------|-------------|---------|
| `$sum` | Somma | `{ $sum: "$importo" }` |
| `$avg` | Media | `{ $avg: "$voto" }` |
| `$min` | Minimo | `{ $min: "$prezzo" }` |
| `$max` | Massimo | `{ $max: "$età" }` |
| `$count` | Conteggio | `{ $sum: 1 }` |
| `$first` | Primo valore | `{ $first: "$nome" }` |
| `$last` | Ultimo valore | `{ $last: "$data" }` |
| `$push` | Array di valori | `{ $push: "$prodotto" }` |
| `$addToSet` | Array univoco | `{ $addToSet: "$tag" }` |

**Esempi:**

```javascript
// Conta ordini per cliente
db.ordini.aggregate([
  { $group: {
      _id: "$cliente",
      numeroOrdini: { $sum: 1 }
  }}
])

// Totale vendite per categoria
db.vendite.aggregate([
  { $group: {
      _id: "$categoria",
      totaleVendite: { $sum: "$importo" }
  }}
])

// Media voti per film
db.recensioni.aggregate([
  { $group: {
      _id: "$filmId",
      votoMedio: { $avg: "$voto" },
      numeroRecensioni: { $sum: 1 }
  }}
])

// Prezzo min/max per categoria
db.prodotti.aggregate([
  { $group: {
      _id: "$categoria",
      prezzoMin: { $min: "$prezzo" },
      prezzoMax: { $max: "$prezzo" }
  }}
])
```

**Raggruppamento globale (_id: null):**

```javascript
// Statistiche su tutta la collezione
db.ordini.aggregate([
  { $group: {
      _id: null,  // Nessun raggruppamento = tutto insieme
      totaleOrdini: { $sum: 1 },
      importoTotale: { $sum: "$importo" },
      importoMedio: { $avg: "$importo" }
  }}
])
```

### 2.4 Stage `$sort`: Ordinare Risultati

Ordina i documenti.

**Sintassi:**

```javascript
{ $sort: { campo: 1 } }   // 1 = crescente, -1 = decrescente
```

**Esempi:**

```javascript
// Ordina per prezzo crescente
db.prodotti.aggregate([
  { $sort: { prezzo: 1 } }
])

// Ordina per data decrescente
db.articoli.aggregate([
  { $sort: { dataPubblicazione: -1 } }
])

// Ordina per multipli campi
db.studenti.aggregate([
  { $sort: { classe: 1, voto: -1 } }
])
```

### 2.5 Stage `$limit` e `$skip`: Paginazione

**$limit:** Limita numero risultati.

```javascript
// Primi 10 risultati
db.prodotti.aggregate([
  { $limit: 10 }
])
```

**$skip:** Salta i primi N risultati.

```javascript
// Salta i primi 20
db.prodotti.aggregate([
  { $skip: 20 }
])
```

**Paginazione:**

```javascript
// Pagina 3 con 10 risultati per pagina
const pagina = 3;
const perPagina = 10;

db.prodotti.aggregate([
  { $skip: (pagina - 1) * perPagina },
  { $limit: perPagina }
])
```

---

## 3. Pipeline Multi-Stage: Esempi Completi

### 3.1 Esempio: Top 5 Clienti per Spesa

```javascript
db.ordini.aggregate([
  // Stage 1: Filtra solo ordini completati
  { $match: { stato: "completato" } },
  
  // Stage 2: Raggruppa per cliente e somma importi
  { $group: {
      _id: "$cliente",
      totaleSpeso: { $sum: "$importo" },
      numeroOrdini: { $sum: 1 }
  }},
  
  // Stage 3: Ordina per totale decrescente
  { $sort: { totaleSpeso: -1 } },
  
  // Stage 4: Prendi solo i primi 5
  { $limit: 5 },
  
  // Stage 5: Rinomina _id in cliente
  { $project: {
      _id: 0,
      cliente: "$_id",
      totaleSpeso: 1,
      numeroOrdini: 1
  }}
])
```

**Output esempio:**

```json
[
  { "cliente": "Mario Rossi", "totaleSpeso": 5240, "numeroOrdini": 12 },
  { "cliente": "Luigi Verdi", "totaleSpeso": 4180, "numeroOrdini": 8 },
  { "cliente": "Anna Bianchi", "totaleSpeso": 3900, "numeroOrdini": 15 },
  ...
]
```

### 3.2 Esempio: Vendite Mensili per Categoria

```javascript
db.vendite.aggregate([
  // Stage 1: Filtra anno 2024
  { $match: { 
      dataVendita: { 
        $gte: ISODate("2024-01-01"), 
        $lt: ISODate("2025-01-01") 
      }
  }},
  
  // Stage 2: Estrai mese dalla data
  { $project: {
      categoria: 1,
      importo: 1,
      mese: { $month: "$dataVendita" }
  }},
  
  // Stage 3: Raggruppa per categoria e mese
  { $group: {
      _id: { 
        categoria: "$categoria", 
        mese: "$mese" 
      },
      totale: { $sum: "$importo" },
      numeroVendite: { $sum: 1 }
  }},
  
  // Stage 4: Ordina per categoria e mese
  { $sort: { 
      "_id.categoria": 1, 
      "_id.mese": 1 
  }}
])
```

### 3.3 Esempio: Media Voti per Studente

```javascript
db.esami.aggregate([
  // Stage 1: Filtra voti >= 18
  { $match: { voto: { $gte: 18 } } },
  
  // Stage 2: Raggruppa per studente
  { $group: {
      _id: "$studenteId",
      mediaVoti: { $avg: "$voto" },
      esamiSuperati: { $sum: 1 },
      votoMigliore: { $max: "$voto" }
  }},
  
  // Stage 3: Arrotonda media a 2 decimali
  { $project: {
      studenteId: "$_id",
      _id: 0,
      mediaVoti: { $round: ["$mediaVoti", 2] },
      esamiSuperati: 1,
      votoMigliore: 1
  }},
  
  // Stage 4: Ordina per media decrescente
  { $sort: { mediaVoti: -1 } }
])
```

---

## 4. Stage Avanzati

### 4.1 Stage `$unwind`: Srotolare Array

Trasforma un documento con array in **multipli documenti**, uno per ogni elemento dell'array.

**Prima:**

```javascript
{
  _id: 1,
  prodotto: "Pizza",
  ingredienti: ["farina", "pomodoro", "mozzarella"]
}
```

**Dopo `$unwind`:**

```javascript
{ _id: 1, prodotto: "Pizza", ingredienti: "farina" }
{ _id: 1, prodotto: "Pizza", ingredienti: "pomodoro" }
{ _id: 1, prodotto: "Pizza", ingredienti: "mozzarella" }
```

**Sintassi:**

```javascript
{ $unwind: "$campoArray" }
```

**Esempio: Contare tags più usati**

```javascript
db.articoli.aggregate([
  // Stage 1: Srotola array tags
  { $unwind: "$tags" },
  
  // Stage 2: Conta occorrenze per tag
  { $group: {
      _id: "$tags",
      count: { $sum: 1 }
  }},
  
  // Stage 3: Ordina per frequenza
  { $sort: { count: -1 } },
  
  // Stage 4: Top 10 tags
  { $limit: 10 }
])
```

**Opzioni `$unwind`:**

```javascript
// Preserva documenti senza array o array vuoti
{ $unwind: { 
    path: "$tags",
    preserveNullAndEmptyArrays: true 
}}

// Aggiungi indice posizione elemento
{ $unwind: { 
    path: "$tags",
    includeArrayIndex: "posizioneTag" 
}}
```

### 4.2 Stage `$lookup`: Join tra Collezioni

Equivale a JOIN SQL - unisce documenti da due collezioni.

**Sintassi:**

```javascript
{ $lookup: {
    from: "collezioneDaUnire",
    localField: "campoLocale",
    foreignField: "campoEsterno",
    as: "nuovoCampoArray"
}}
```

**Esempio: Ordini con Dettagli Cliente**

```javascript
// Collezione ordini
{
  _id: 1,
  clienteId: 101,
  importo: 250,
  data: ISODate("2024-01-15")
}

// Collezione clienti
{
  _id: 101,
  nome: "Mario Rossi",
  email: "mario@example.com"
}

// Aggregation con $lookup
db.ordini.aggregate([
  { $lookup: {
      from: "clienti",
      localField: "clienteId",
      foreignField: "_id",
      as: "dettagliCliente"
  }},
  { $unwind: "$dettagliCliente" },  // Srotola array risultato
  { $project: {
      _id: 1,
      importo: 1,
      nomeCliente: "$dettagliCliente.nome",
      emailCliente: "$dettagliCliente.email"
  }}
])
```

**Risultato:**

```javascript
{
  _id: 1,
  importo: 250,
  nomeCliente: "Mario Rossi",
  emailCliente: "mario@example.com"
}
```

**Esempio: Prodotti con Recensioni**

```javascript
db.prodotti.aggregate([
  { $lookup: {
      from: "recensioni",
      localField: "_id",
      foreignField: "prodottoId",
      as: "recensioni"
  }},
  { $project: {
      nome: 1,
      prezzo: 1,
      numeroRecensioni: { $size: "$recensioni" },
      votoMedio: { $avg: "$recensioni.voto" }
  }}
])
```

### 4.3 Stage `$addFields`: Aggiungere Campi Calcolati

Aggiunge nuovi campi senza eliminare quelli esistenti (diverso da `$project`).

**Sintassi:**

```javascript
{ $addFields: { 
    nuovoCampo: espressione 
}}
```

**Esempi:**

```javascript
// Aggiungi campo calcolato
db.prodotti.aggregate([
  { $addFields: {
      prezzoConIVA: { $multiply: ["$prezzo", 1.22] },
      scontato: { $gt: ["$sconto", 0] }
  }}
])

// Concatena stringhe
db.utenti.aggregate([
  { $addFields: {
      nomeCompleto: { 
        $concat: ["$nome", " ", "$cognome"] 
      }
  }}
])

// Differenza date
db.eventi.aggregate([
  { $addFields: {
      durataGiorni: {
        $divide: [
          { $subtract: ["$dataFine", "$dataInizio"] },
          1000 * 60 * 60 * 24  // Millisecondi in un giorno
        ]
      }
  }}
])
```

### 4.4 Stage `$bucket`: Raggruppare per Range

Raggruppa documenti in "bucket" basati su range di valori.

**Esempio: Distribuzione Prezzi**

```javascript
db.prodotti.aggregate([
  { $bucket: {
      groupBy: "$prezzo",
      boundaries: [0, 50, 100, 500, 1000, 5000],
      default: "Oltre 5000",
      output: {
        count: { $sum: 1 },
        prodotti: { $push: "$nome" }
      }
  }}
])
```

**Output:**

```javascript
[
  { _id: 0, count: 15, prodotti: [...] },      // 0-50€
  { _id: 50, count: 32, prodotti: [...] },     // 50-100€
  { _id: 100, count: 20, prodotti: [...] },    // 100-500€
  { _id: 500, count: 8, prodotti: [...] },     // 500-1000€
  { _id: "Oltre 5000", count: 2, prodotti: [...] }
]
```

---

## 5. Operatori di Espressione

### 5.1 Operatori Aritmetici

```javascript
// Addizione
{ $add: [10, "$campo", 5] }  // 10 + campo + 5

// Sottrazione
{ $subtract: ["$totale", "$sconto"] }

// Moltiplicazione
{ $multiply: ["$prezzo", "$quantita"] }

// Divisione
{ $divide: ["$totale", "$numeroOrdini"] }

// Modulo
{ $mod: ["$numero", 10] }  // Resto divisione per 10

// Potenza
{ $pow: ["$base", 2] }  // base^2
```

### 5.2 Operatori di Confronto

```javascript
// Uguaglianza
{ $eq: ["$campo", valore] }

// Maggiore
{ $gt: ["$prezzo", 100] }

// Minore o uguale
{ $lte: ["$età", 18] }

// In array
{ $in: ["$categoria", ["A", "B", "C"]] }
```

### 5.3 Operatori Logici

```javascript
// AND
{ $and: [condizione1, condizione2] }

// OR
{ $or: [condizione1, condizione2] }

// NOT
{ $not: condizione }

// Condizione (if-then-else)
{ $cond: { 
    if: { $gte: ["$prezzo", 100] },
    then: "Costoso",
    else: "Economico"
}}
```

### 5.4 Operatori su Stringhe

```javascript
// Concatenazione
{ $concat: ["$nome", " ", "$cognome"] }

// Estrai sottostringa
{ $substr: ["$testo", 0, 10] }  // Primi 10 caratteri

// Minuscolo/Maiuscolo
{ $toLower: "$email" }
{ $toUpper: "$codice" }

// Lunghezza stringa
{ $strLenCP: "$password" }
```

### 5.5 Operatori su Date

```javascript
// Anno
{ $year: "$dataCreazione" }

// Mese (1-12)
{ $month: "$dataNascita" }

// Giorno del mese
{ $dayOfMonth: "$data" }

// Giorno della settimana (1=domenica, 7=sabato)
{ $dayOfWeek: "$data" }

// Differenza tra date (millisecondi)
{ $subtract: [ISODate("2024-12-31"), ISODate("2024-01-01")] }
```

### 5.6 Operatori su Array

```javascript
// Dimensione array
{ $size: "$tags" }

// Primo elemento
{ $arrayElemAt: ["$array", 0] }

// Ultimo elemento
{ $arrayElemAt: ["$array", -1] }

// Filtra array
{ $filter: {
    input: "$ordini",
    as: "ordine",
    cond: { $gt: ["$$ordine.importo", 100] }
}}

// Map su array
{ $map: {
    input: "$prodotti",
    as: "prod",
    in: { $multiply: ["$$prod.prezzo", 1.1] }
}}
```

---

## 6. Esempi Reali Complessi

### 6.1 Dashboard E-commerce

```javascript
// Statistiche vendite complete
db.ordini.aggregate([
  // Filtra ultimo mese
  { $match: {
      dataOrdine: { 
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
      }
  }},
  
  // Lookup prodotti
  { $lookup: {
      from: "prodotti",
      localField: "prodottoId",
      foreignField: "_id",
      as: "prodotto"
  }},
  { $unwind: "$prodotto" },
  
  // Calcola ricavo per ordine
  { $addFields: {
      ricavo: { $multiply: ["$quantita", "$prodotto.prezzo"] }
  }},
  
  // Raggruppa per categoria
  { $group: {
      _id: "$prodotto.categoria",
      totaleVendite: { $sum: "$ricavo" },
      quantitaVenduta: { $sum: "$quantita" },
      numeroOrdini: { $sum: 1 },
      prezzoMedio: { $avg: "$prodotto.prezzo" }
  }},
  
  // Ordina per vendite
  { $sort: { totaleVendite: -1 } }
])
```

### 6.2 Analisi Recensioni Prodotti

```javascript
db.recensioni.aggregate([
  // Raggruppa per prodotto
  { $group: {
      _id: "$prodottoId",
      votoMedio: { $avg: "$voto" },
      numeroRecensioni: { $sum: 1 },
      votoMinimo: { $min: "$voto" },
      votoMassimo: { $max: "$voto" }
  }},
  
  // Filtra solo prodotti con 10+ recensioni
  { $match: { numeroRecensioni: { $gte: 10 } } },
  
  // Lookup dettagli prodotto
  { $lookup: {
      from: "prodotti",
      localField: "_id",
      foreignField: "_id",
      as: "prodotto"
  }},
  { $unwind: "$prodotto" },
  
  // Aggiungi stelline (arrotonda voto medio)
  { $addFields: {
      stelle: { $round: ["$votoMedio", 0] }
  }},
  
  // Proiezione finale
  { $project: {
      _id: 0,
      prodotto: "$prodotto.nome",
      votoMedio: { $round: ["$votoMedio", 2] },
      stelle: 1,
      numeroRecensioni: 1
  }},
  
  // Top 20
  { $sort: { votoMedio: -1 } },
  { $limit: 20 }
])
```

### 6.3 Report Studenti con Media Pesata

```javascript
db.esami.aggregate([
  // Lookup dettagli corso
  { $lookup: {
      from: "corsi",
      localField: "corsoId",
      foreignField: "_id",
      as: "corso"
  }},
  { $unwind: "$corso" },
  
  // Calcola voto pesato
  { $addFields: {
      votoPesato: { $multiply: ["$voto", "$corso.crediti"] }
  }},
  
  // Raggruppa per studente
  { $group: {
      _id: "$studenteId",
      sommaVotiPesati: { $sum: "$votoPesato" },
      sommaCreditiEsami: { $sum: "$corso.crediti" },
      esamiSostenuti: { $sum: 1 }
  }},
  
  // Calcola media pesata
  { $addFields: {
      mediaPesata: { 
        $divide: ["$sommaVotiPesati", "$sommaCreditiEsami"] 
      }
  }},
  
  // Lookup dati studente
  { $lookup: {
      from: "studenti",
      localField: "_id",
      foreignField: "_id",
      as: "studente"
  }},
  { $unwind: "$studente" },
  
  // Proiezione finale
  { $project: {
      _id: 0,
      nome: "$studente.nome",
      cognome: "$studente.cognome",
      matricola: "$studente.matricola",
      mediaPesata: { $round: ["$mediaPesata", 2] },
      creditiConseguiti: "$sommaCreditiEsami",
      esamiSostenuti: 1
  }},
  
  // Ordina per media
  { $sort: { mediaPesata: -1 } }
])
```

---

## 7. Performance e Best Practices

### 7.1 Ottimizzazione Pipeline

✅ **Stage `$match` all'inizio:**

```javascript
// ✅ BUONO: Filtra prima
db.ordini.aggregate([
  { $match: { anno: 2024 } },  // Riduce documenti
  { $group: {...} }
])

// ❌ CATTIVO: Raggruppa tutto poi filtra
db.ordini.aggregate([
  { $group: {...} },
  { $match: { anno: 2024 } }  // Troppo tardi!
])
```

✅ **Usa indici:**

```javascript
// Crea indice su campo usato in $match
db.ordini.createIndex({ dataOrdine: 1 })

// Ora questa query userà l'indice
db.ordini.aggregate([
  { $match: { 
      dataOrdine: { $gte: ISODate("2024-01-01") }
  }}
])
```

✅ **Proiezione early:**

```javascript
// Seleziona solo campi necessari subito
db.collezione.aggregate([
  { $project: { campo1: 1, campo2: 1 } },  // Solo ciò che serve
  { $group: {...} }
])
```

❌ **Evita `$lookup` su collezioni enormi:**

```javascript
// Se possibile, denormalizza i dati
// Invece di JOIN, duplica informazioni critiche
```

### 7.2 Limiti e Considerazioni

**Limiti:**
- Pipeline può processare max **100MB di RAM** per stage (usa `allowDiskUse: true`)
- Documenti output max **16MB** ciascuno
- Pipeline max **1000 stage** (praticamente illimitato)

**Allow Disk Use:**

```javascript
db.collezione.aggregate([
  // Pipeline complessa
], { allowDiskUse: true })  // Usa disco se supera 100MB RAM
```

**Explain:**

```javascript
// Analizza performance
db.ordini.aggregate([
  { $match: { anno: 2024 } },
  { $group: { _id: "$cliente", tot: { $sum: "$importo" } } }
], { explain: true })
```

---

## 8. Esercizi Pratici

### Esercizio 1: E-commerce Analytics

Dato un database con `ordini`, `prodotti`, `clienti`:

1. Totale vendite per categoria (ultimo anno)
2. Top 10 prodotti più venduti
3. Clienti con spesa > 1000€
4. Media recensioni per prodotto
5. Vendite per mese (grafico)

### Esercizio 2: Social Network

Dato `posts`, `utenti`, `commenti`:

1. Post con più like
2. Utenti più attivi (per numero post)
3. Media commenti per post
4. Hashtag più usati
5. Engagement rate per utente

### Esercizio 3: Sistema Scolastico

Dato `studenti`, `esami`, `corsi`:

1. Media voti per corso
2. Studenti con media >= 27
3. Corsi con tasso bocciatura > 30%
4. Distribuzione voti (bucket)
5. Ranking studenti per media pesata

---

## 9. Riepilogo

**Stage fondamentali:**
- `$match`: Filtra documenti
- `$project`: Seleziona/calcola campi
- `$group`: Raggruppa e aggrega
- `$sort`: Ordina risultati
- `$limit/$skip`: Paginazione

**Stage avanzati:**
- `$unwind`: Srotola array
- `$lookup`: Join collezioni
- `$addFields`: Aggiungi campi
- `$bucket`: Raggruppa per range

**Best Practices:**
- `$match` all'inizio
- Usa indici
- Proiezioni early
- `allowDiskUse` per dataset grandi
- Monitora con `explain()`

**Risorse:**
- [Aggregation Pipeline](https://www.mongodb.com/docs/manual/aggregation/)
- [Aggregation Operators](https://www.mongodb.com/docs/manual/reference/operator/aggregation/)
- [Aggregation Performance](https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/)

---

**Prossimo modulo:** [Schema e Modellazione Dati](../04-Schema/01-Modellazione.md)
