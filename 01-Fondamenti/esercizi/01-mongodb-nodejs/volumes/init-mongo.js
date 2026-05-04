// Script di inizializzazione MongoDB
// Questo file viene eseguito automaticamente al primo avvio del container

db = db.getSiblingDB('biblioteca');

// Crea la collezione 'libri' e inserisce documenti iniziali
db.libri.insertMany([
  {
    titolo: "Il nome della rosa",
    autore: "Umberto Eco",
    anno: 1980,
    genere: "Romanzo storico",
    disponibile: true,
    copie: 3,
    tags: ["classico", "italiano", "mistero"]
  },
  {
    titolo: "1984",
    autore: "George Orwell",
    anno: 1949,
    genere: "Distopia",
    disponibile: true,
    copie: 5,
    tags: ["classico", "distopia", "politica"]
  },
  {
    titolo: "Il Signore degli Anelli",
    autore: "J.R.R. Tolkien",
    anno: 1954,
    genere: "Fantasy",
    disponibile: true,
    copie: 2,
    tags: ["fantasy", "epico", "avventura"]
  },
  {
    titolo: "Harry Potter e la pietra filosofale",
    autore: "J.K. Rowling",
    anno: 1997,
    genere: "Fantasy",
    disponibile: false,
    copie: 0,
    tags: ["fantasy", "young adult", "magia"]
  },
  {
    titolo: "Orgoglio e pregiudizio",
    autore: "Jane Austen",
    anno: 1813,
    genere: "Romanzo",
    disponibile: true,
    copie: 4,
    tags: ["classico", "romantico", "inglese"]
  }
]);

// Crea indici per migliorare le performance
db.libri.createIndex({ titolo: 1 });
db.libri.createIndex({ autore: 1 });
db.libri.createIndex({ genere: 1 });

print('Database biblioteca inizializzato con successo!');
print('Libri inseriti: ' + db.libri.countDocuments());
