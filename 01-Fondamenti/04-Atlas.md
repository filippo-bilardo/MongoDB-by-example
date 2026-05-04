# Capitolo 4 — MongoDB Atlas: Database nel Cloud

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Comprendere cos'è MongoDB Atlas e i suoi vantaggi
- Creare un account gratuito su MongoDB Atlas
- Configurare un cluster MongoDB nel cloud
- Gestire utenti e sicurezza (IP Whitelist, credenziali)
- Connetterti ad Atlas con `mongosh` e Compass
- Usare le funzionalità principali di Atlas (backup, monitoring, performance)
- Comprendere i piani gratuiti vs pagamento

---

## 1. Cos'è MongoDB Atlas?

**MongoDB Atlas** è la piattaforma **Database-as-a-Service (DBaaS)** ufficiale di MongoDB. Offre database MongoDB completamente gestiti nel cloud.

### 1.1 Caratteristiche principali

✅ **Completamente gestito**: nessuna installazione o manutenzione  
✅ **Multi-cloud**: disponibile su AWS, Azure, Google Cloud  
✅ **Scalabilità automatica**: adatta le risorse al carico  
✅ **Backup automatici**: snapshot giornalieri e point-in-time recovery  
✅ **Sicurezza integrata**: crittografia, autenticazione, network isolation  
✅ **Monitoring e alerting**: dashboard in tempo reale  
✅ **Piano gratuito**: cluster M0 gratis per sempre (512 MB storage)

### 1.2 Quando usare Atlas

✅ **Applicazioni in produzione** senza gestire infrastruttura  
✅ **Sviluppo e testing** con cluster gratuiti  
✅ **Progetti personali** senza costi di server  
✅ **Startup e MVP** per deployment veloce  
✅ **Scalabilità globale** con replica multi-regione

---

## 2. MongoDB Atlas vs MongoDB locale/Docker

| Aspetto | MongoDB Locale/Docker | MongoDB Atlas |
|---------|----------------------|---------------|
| **Installazione** | Manuale | Nessuna |
| **Manutenzione** | A carico tuo | Automatica |
| **Backup** | Manuale (mongodump) | Automatico |
| **Scalabilità** | Manuale | Automatica |
| **Sicurezza** | Configurazione manuale | Gestita |
| **Costo** | Server/VM | Freemium (gratis fino a 512MB) |
| **Accesso remoto** | Configurazione di rete | Integrato |
| **Monitoring** | Tool esterni | Dashboard inclusa |
| **Aggiornamenti** | Manuali | Automatici |

**Quando usare locale/Docker:**
- Sviluppo offline
- Test rapidi
- Imparare MongoDB
- Ambiente isolato

**Quando usare Atlas:**
- Produzione
- Collaborazione team
- Accesso da più dispositivi
- Deployment semplificato

---

## 3. Creare un account MongoDB Atlas

### 3.1 Registrazione

1. **Vai su MongoDB Atlas**  
   [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)

2. **Scegli metodo di registrazione**
   - Email e password
   - Google account
   - GitHub account

3. **Compila il form**
   - Nome
   - Cognome
   - Email
   - Password (se non usi OAuth)

4. **Verifica email**  
   Controlla la tua casella email e clicca sul link di verifica

5. **Questionario iniziale** (opzionale)
   - Scopo dell'uso (Learn, Build, Deploy)
   - Linguaggio preferito
   - Tipo di progetto

---

## 4. Creare un cluster gratuito

### 4.1 Passo 1: Deploy del cluster

1. **Clicca su "Build a Database"**

2. **Scegli il piano FREE**
   - **Shared** → **M0 Sandbox** (GRATUITO)
   - 512 MB storage
   - RAM condivisa
   - Nessuna carta di credito richiesta

3. **Seleziona il cloud provider**
   - AWS
   - Google Cloud
   - Azure
   
   **Suggerimento**: scegli il provider più vicino geograficamente

4. **Seleziona la regione**
   - Esempi per l'Italia:
     - AWS: `eu-central-1` (Frankfurt, Germania)
     - Google Cloud: `europe-west1` (Belgium)
     - Azure: `westeurope` (Paesi Bassi)

5. **Nomina il cluster**
   - Default: `Cluster0`
   - Puoi personalizzare: `MioProgetto`, `DevCluster`, ecc.

6. **Clicca "Create"**
   - Il cluster sarà pronto in 1-3 minuti

### 4.2 Limiti del piano gratuito

| Risorsa | M0 (Gratuito) | M10 (Primo pagamento) |
|---------|---------------|----------------------|
| Storage | 512 MB | 10 GB - 4 TB |
| RAM | Condivisa | 2 GB - 768 GB |
| vCPU | Condivisa | Dedicata |
| Connessioni | Max 100 | Max 1500+ |
| Backup | Nessuno | Snapshot automatici |
| Regioni | 1 | Multi-regione |
| Supporto | Community | Tecnico 24/7 |

**Il piano M0 è perfetto per:**
- Imparare MongoDB
- Prototipi e MVP
- Progetti personali
- Testing e sviluppo

---

## 5. Configurare la sicurezza

### 5.1 Creare un utente database

1. **Security → Database Access**

2. **Clicca "Add New Database User"**

3. **Scegli metodo di autenticazione**
   - **Password** (consigliato per iniziare)
   - Certificate
   - AWS IAM

4. **Configurazione utente**
   - **Username**: `admin` (o nome personalizzato)
   - **Password**: genera automatica o crea una password sicura
     - ⚠️ **SALVA LA PASSWORD**: ti servirà per connetterti!
   - **Database User Privileges**:
     - `Atlas admin` (tutti i permessi)
     - `Read and write to any database`
     - `Only read any database`
   
5. **Clicca "Add User"**

**Esempio:**
```
Username: myAppUser
Password: Abcd1234!@#$
Privilege: Read and write to any database
```

### 5.2 Configurare Network Access (IP Whitelist)

MongoDB Atlas consente l'accesso solo da indirizzi IP autorizzati.

1. **Security → Network Access**

2. **Clicca "Add IP Address"**

3. **Scegli opzione**:

   **Opzione A: IP corrente**
   - Clicca "Add Current IP Address"
   - Autorizza solo il tuo computer

   **Opzione B: Accesso da ovunque** (⚠️ solo per sviluppo)
   - Inserisci: `0.0.0.0/0`
   - Consente connessioni da qualsiasi IP
   - **NON usare in produzione!**

   **Opzione C: IP specifici**
   - Inserisci IP statico del tuo server
   - Esempio: `203.0.113.42/32`

4. **Aggiungi commento** (opzionale)
   - "Mio laptop"
   - "Server produzione"
   - "Ufficio aziendale"

5. **Clicca "Confirm"**

**Best practice:**
- ✅ Usa IP specifici in produzione
- ✅ Aggiungi solo IP necessari
- ❌ Non usare `0.0.0.0/0` in produzione

---

## 6. Ottenere la stringa di connessione

### 6.1 Connection String URI

1. **Database → Cluster → Connect**

2. **Scegli metodo di connessione**:
   - **Shell**: per `mongosh`
   - **Compass**: per MongoDB Compass
   - **Drivers**: per applicazioni (Node.js, Python, ecc.)

3. **Copia la stringa di connessione**

**Formato generale:**

```
mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

**Esempio:**

```
mongodb+srv://myAppUser:Abcd1234!@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
```

**Componenti:**
- `mongodb+srv://`: protocollo (SRV record DNS)
- `myAppUser`: username del database user
- `Abcd1234!`: password (sostituisci con la tua)
- `cluster0.abc12.mongodb.net`: hostname del cluster
- `?retryWrites=true&w=majority`: opzioni di connessione

### 6.2 Personalizzare la stringa di connessione

```bash
# Connettersi a un database specifico
mongodb+srv://user:pass@cluster0.abc12.mongodb.net/mioDatabase

# Specificare opzioni aggiuntive
mongodb+srv://user:pass@cluster0.abc12.mongodb.net/mydb?retryWrites=true&w=majority&appName=MyApp

# Autenticazione su database specifico
mongodb+srv://user:pass@cluster0.abc12.mongodb.net/mydb?authSource=admin
```

---

## 7. Connettersi con `mongosh`

### 7.1 Installazione di `mongosh` (se necessario)

```bash
# macOS
brew install mongosh

# Windows: scarica da
# https://www.mongodb.com/try/download/shell

# Linux
wget https://downloads.mongodb.com/compass/mongosh-2.0.0-linux-x64.tgz
tar -zxvf mongosh-2.0.0-linux-x64.tgz
sudo cp mongosh-2.0.0-linux-x64/bin/mongosh /usr/local/bin/
```

### 7.2 Connessione

```bash
# Copia la stringa da Atlas e sostituisci <password>
mongosh "mongodb+srv://myAppUser:Abcd1234!@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority"
```

**Output:**

```
Current Mongosh Log ID: 6641f2a3b4c5d6e7f8a9b0c1
Connecting to: mongodb+srv://cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
Using MongoDB: 7.0.0
Using Mongosh: 2.0.0

Atlas atlas-abc123-shard-0 [primary] test>
```

**Nota il prompt:** indica che sei connesso a un cluster Atlas!

### 7.3 Test della connessione

```javascript
// Verifica versione
db.version()

// Lista database
show dbs

// Crea database di test
use test_database

// Inserisci un documento
db.test_collection.insertOne({ messaggio: "Ciao da Atlas!" })

// Leggi i documenti
db.test_collection.find()
```

---

## 8. Connettersi con MongoDB Compass

### 8.1 Ottenere la stringa per Compass

1. **Database → Connect → Compass**
2. **Copia la stringa di connessione**
3. **Sostituisci `<password>` con la tua password**

### 8.2 Connessione

1. **Apri MongoDB Compass**
2. **Incolla la stringa di connessione** nel campo URI
3. **Clicca "Connect"**

**Esempio URI:**

```
mongodb+srv://myAppUser:Abcd1234!@cluster0.abc12.mongodb.net/
```

### 8.3 Esplorazione con Compass

- **Databases**: visualizza tutti i database
- **Collections**: esplora le collezioni
- **Documents**: visualizza e modifica documenti
- **Schema**: analizza la struttura dei dati
- **Explain Plan**: ottimizza le query
- **Indexes**: gestisci gli indici

---

## 9. Funzionalità principali di Atlas

### 9.1 Database Dashboard

**Overview**:
- Stato del cluster (running, paused)
- Versione MongoDB
- Tipo di cluster (M0, M10, M30, ecc.)
- Connessioni attive
- Storage utilizzato

**Metrics**:
- Operations per secondo
- Query performance
- Disk I/O
- Network throughput

### 9.2 Collections Browser

Gestisci collezioni e documenti direttamente nel browser:

1. **Database → Browse Collections**
2. **Visualizza documenti** in formato JSON
3. **Inserisci, modifica, elimina** documenti
4. **Filtra e ricerca** con query
5. **Esporta dati** in JSON o CSV

### 9.3 Performance Advisor

Suggerimenti automatici per migliorare le performance:

- Indici mancanti
- Query lente
- Schemi non ottimizzati
- Operazioni costose

**Accesso:** Database → Performance Advisor

### 9.4 Real-Time Performance Panel

Monitora in tempo reale:
- Query lente
- Operazioni in esecuzione
- Utilizzo CPU e memoria
- Connessioni attive

### 9.5 Alerts

Configura notifiche per:
- Utilizzo storage > 75%
- Connessioni > 80%
- Query lente
- Errori di replica

**Configurazione:** Alert Settings → Create Alert

### 9.6 Backup (solo piani a pagamento)

- **Snapshot automatici**: giornalieri, settimanali, mensili
- **Point-in-time restore**: ripristina a un momento specifico
- **Retention policy**: conservazione 1-365 giorni

### 9.7 Data Explorer

Strumento integrato per query:

```javascript
// Filtro
{ categoria: "Smartphone", prezzo: { $lt: 1000 } }

// Proiezione
{ nome: 1, prezzo: 1, _id: 0 }

// Ordinamento
{ prezzo: -1 }
```

---

## 10. Gestire il cluster

### 10.1 Pausa e riavvio cluster

**Cluster M0 gratuiti si mettono in pausa automaticamente** dopo 60 giorni di inattività.

**Pausa manuale:**
1. Database → Cluster → ...
2. "Pause Cluster"
3. Conferma

**Riavvio:**
1. Clicca "Resume"

**Nota:** i dati non vengono persi durante la pausa.

### 10.2 Eliminare cluster

⚠️ **ATTENZIONE: elimina tutti i dati!**

1. Database → Cluster → ...
2. "Terminate"
3. Digita il nome del cluster
4. Conferma

**Backup prima di eliminare!**

### 10.3 Upgrade del cluster

Passa da M0 (gratuito) a piani a pagamento:

1. Database → Cluster → ...
2. "Edit Configuration"
3. Scegli tier superiore (M10, M20, M30...)
4. Conferma

**Costi mensili:**
- M10 (2GB RAM): ~$0.08/ora (~$57/mese)
- M20 (4GB RAM): ~$0.20/ora (~$144/mese)
- M30 (8GB RAM): ~$0.54/ora (~$389/mese)

---

## 11. Integrare Atlas con applicazioni

### 11.1 Node.js con MongoDB Driver

```bash
npm install mongodb
```

```javascript
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://myUser:myPass@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connesso ad Atlas!");
    
    const database = client.db("negozio");
    const prodotti = database.collection("prodotti");
    
    // Inserisci documento
    await prodotti.insertOne({ 
      nome: "Laptop", 
      prezzo: 1200 
    });
    
    // Leggi documenti
    const risultato = await prodotti.find().toArray();
    console.log(risultato);
    
  } finally {
    await client.close();
  }
}

run();
```

### 11.2 Python con PyMongo

```bash
pip install pymongo[srv]
```

```python
from pymongo import MongoClient

uri = "mongodb+srv://myUser:myPass@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(uri)

db = client["negozio"]
collection = db["prodotti"]

# Inserisci
collection.insert_one({"nome": "Laptop", "prezzo": 1200})

# Leggi
for doc in collection.find():
    print(doc)

client.close()
```

### 11.3 Variabili d'ambiente

**NON hardcodare mai credenziali nel codice!**

**File `.env`:**

```
MONGODB_URI=mongodb+srv://myUser:myPass@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
```

**Node.js con dotenv:**

```javascript
require('dotenv').config();
const uri = process.env.MONGODB_URI;
```

---

## 12. Best practices per Atlas

### 12.1 Sicurezza

✅ **Usa password forti** (20+ caratteri, mix di caratteri)  
✅ **Limita IP whitelist** (no `0.0.0.0/0` in produzione)  
✅ **Crea utenti con privilegi minimi** (read-only quando possibile)  
✅ **Usa variabili d'ambiente** per credenziali  
✅ **Ruota password regolarmente**  
✅ **Abilita 2FA** sull'account Atlas

### 12.2 Performance

✅ **Crea indici** su campi usati nelle query  
✅ **Usa proiezioni** per limitare i dati trasferiti  
✅ **Monitora query lente** (Performance Advisor)  
✅ **Connection pooling** nelle applicazioni  
✅ **Scegli regione vicina** ai tuoi utenti

### 12.3 Costi

✅ **Inizia con M0 gratuito** per sviluppo  
✅ **Monitora storage e operazioni**  
✅ **Elimina dati non necessari**  
✅ **Usa TTL indexes** per pulizia automatica  
✅ **Configura alerting** per evitare sorprese

### 12.4 Sviluppo

✅ **Cluster separati** per dev/staging/production  
✅ **Backup regolari** (export con mongoexport)  
✅ **Testa connessione** prima del deploy  
✅ **Usa connection string naming** (DATABASE_URL_DEV, DATABASE_URL_PROD)

---

## 13. Troubleshooting

### 13.1 Errore: "Authentication failed"

**Cause:**
- Password errata
- Username errato
- Utente non creato

**Soluzione:**
1. Verifica credenziali in Security → Database Access
2. Resetta password
3. Verifica che l'utente abbia i permessi corretti

### 13.2 Errore: "Connection timeout"

**Cause:**
- IP non autorizzato
- Firewall blocca porta 27017
- Cluster in pausa

**Soluzione:**
1. Verifica IP in Security → Network Access
2. Aggiungi IP corrente
3. Riavvia cluster se in pausa

### 13.3 Errore: "ECONNREFUSED"

**Causa:** stai usando URI locale invece di Atlas

**Soluzione:** usa la stringa `mongodb+srv://` di Atlas, non `mongodb://localhost:27017`

### 13.4 Cluster lento

**Cause:**
- M0 ha risorse limitate
- Indici mancanti
- Query non ottimizzate

**Soluzione:**
1. Crea indici con Performance Advisor
2. Ottimizza query
3. Considera upgrade a M10+

---

## 14. Risorse utili

- **Atlas Dashboard**: [https://cloud.mongodb.com](https://cloud.mongodb.com)
- **Documentazione Atlas**: [https://www.mongodb.com/docs/atlas/](https://www.mongodb.com/docs/atlas/)
- **Atlas CLI**: [https://www.mongodb.com/docs/atlas/cli/](https://www.mongodb.com/docs/atlas/cli/)
- **Support**: [https://support.mongodb.com](https://support.mongodb.com)
- **Community Forums**: [https://www.mongodb.com/community/forums/](https://www.mongodb.com/community/forums/)

---

## Riepilogo

In questo capitolo hai imparato:

✅ Cos'è MongoDB Atlas e i suoi vantaggi  
✅ Come creare un account e un cluster gratuito M0  
✅ Configurare sicurezza (utenti database, IP whitelist)  
✅ Ottenere e usare la stringa di connessione  
✅ Connettersi con `mongosh` e MongoDB Compass  
✅ Funzionalità principali di Atlas (monitoring, performance, alerts)  
✅ Integrare Atlas con applicazioni Node.js e Python  
✅ Best practices per sicurezza, performance e costi  
✅ Troubleshooting problemi comuni

Ora hai un database MongoDB nel cloud pronto per lo sviluppo e il deployment delle tue applicazioni!

---

## Esercizi

Vai alla cartella [esercizi/](./esercizi/) per mettere in pratica i concetti appresi!
