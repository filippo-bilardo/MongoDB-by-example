# Capitolo 2 — MongoDB con Docker

## Obiettivi del capitolo

Al termine di questo capitolo sarai in grado di:
- Comprendere i vantaggi di usare Docker per MongoDB
- Installare Docker sul tuo sistema
- Eseguire MongoDB in un container Docker
- Gestire volumi per persistere i dati
- Usare `docker-compose` per orchestrare MongoDB
- Connetterti al container con `mongosh`

---

## 1. Perché usare Docker con MongoDB?

**Docker** è una piattaforma che permette di eseguire applicazioni all'interno di **container**, ambienti isolati e portatili che contengono tutto il necessario per far funzionare un'applicazione.

### Vantaggi di usare Docker per MongoDB

✅ **Installazione rapida**: nessuna configurazione manuale del sistema  
✅ **Isolamento**: MongoDB gira in un ambiente separato dal sistema host  
✅ **Portabilità**: stesso ambiente su Windows, macOS e Linux  
✅ **Versioni multiple**: puoi eseguire diverse versioni di MongoDB contemporaneamente  
✅ **Pulizia facile**: rimuovi il container senza lasciare tracce sul sistema  
✅ **Ambiente di sviluppo riproducibile**: stesso setup per tutto il team  
✅ **Deploy semplificato**: lo stesso container funziona in produzione

---

## 2. Installazione di Docker

### 2.1 Installazione su Windows

1. **Scarica Docker Desktop per Windows**  
   Vai su [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

2. **Esegui l'installer**  
   - Segui la procedura guidata
   - Riavvia il computer se richiesto
   - Docker Desktop si avvierà automaticamente

3. **Verifica l'installazione**  
   Apri PowerShell o CMD e digita:
   ```bash
   docker --version
   ```

   Output atteso:
   ```
   Docker version 24.0.0, build abc1234
   ```

### 2.2 Installazione su macOS

1. **Scarica Docker Desktop per Mac**  
   Vai su [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)  
   Scegli la versione per chip Intel o Apple Silicon (M1/M2)

2. **Installa Docker Desktop**  
   - Apri il file `.dmg` scaricato
   - Trascina Docker nella cartella Applicazioni
   - Avvia Docker Desktop

3. **Verifica l'installazione**  
   Apri il Terminale e digita:
   ```bash
   docker --version
   ```

### 2.3 Installazione su Linux (Ubuntu/Debian)

```bash
# Aggiorna i pacchetti
sudo apt update

# Installa i prerequisiti
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Aggiungi la chiave GPG di Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Aggiungi il repository Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installa Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Avvia Docker
sudo systemctl start docker
sudo systemctl enable docker

# Aggiungi il tuo utente al gruppo docker (per usare Docker senza sudo)
sudo usermod -aG docker $USER

# Riavvia la sessione o esegui:
newgrp docker
```

**Verifica:**

```bash
docker --version
```

---

## 3. Concetti base di Docker

### 3.1 Immagini e Container

- **Immagine**: un template read-only che contiene il filesystem e le configurazioni per eseguire un'applicazione
- **Container**: un'istanza in esecuzione di un'immagine

**Analogia:**
- Immagine = Ricetta di una torta
- Container = Torta reale che hai preparato seguendo la ricetta

### 3.2 Docker Hub

**Docker Hub** è il registro pubblico di immagini Docker. MongoDB fornisce immagini ufficiali su:  
[https://hub.docker.com/_/mongo](https://hub.docker.com/_/mongo)

---

## 4. Eseguire MongoDB con `docker run`

### 4.1 Comando base

Il modo più semplice per eseguire MongoDB in Docker:

```bash
docker run --name mio-mongodb -d mongo
```

**Spiegazione dei parametri:**
- `docker run`: esegue un nuovo container
- `--name mio-mongodb`: assegna un nome al container
- `-d`: esegue il container in background (detached mode)
- `mongo`: nome dell'immagine da usare (verrà scaricata da Docker Hub)

### 4.2 Verifica del container

```bash
# Visualizza i container in esecuzione
docker ps

# Output:
# CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS       NAMES
# a1b2c3d4e5f6   mongo     "docker-entrypoint.s…"   10 seconds ago   Up 9 seconds    27017/tcp   mio-mongodb
```

### 4.3 Esporre la porta

Per connetterti a MongoDB dall'host, devi mappare la porta del container:

```bash
docker run --name mio-mongodb -p 27017:27017 -d mongo
```

**Parametro `-p`:**
- `-p 27017:27017`: mappa la porta 27017 del container alla porta 27017 dell'host
- Formato: `-p <porta_host>:<porta_container>`

Ora puoi connetterti a MongoDB da `localhost:27017`!

---

## 5. Persistenza dei dati con volumi Docker

⚠️ **Problema**: se elimini il container, tutti i dati vengono persi!

**Soluzione**: usa un **volume Docker** per salvare i dati al di fuori del container.

### 5.1 Creare un volume

```bash
# Crea un volume nominato
docker volume create mongodb-data
```

### 5.2 Eseguire MongoDB con volume

```bash
docker run --name mio-mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  -d mongo
```

**Parametro `-v`:**
- `-v mongodb-data:/data/db`: monta il volume `mongodb-data` nella cartella `/data/db` del container
- `/data/db` è la directory predefinita dove MongoDB salva i dati

**Vantaggi:**
✅ I dati persistono anche se elimini il container  
✅ Puoi creare un nuovo container e ricollegare lo stesso volume

### 5.3 Gestione dei volumi

```bash
# Elenco dei volumi
docker volume ls

# Ispeziona un volume
docker volume inspect mongodb-data

# Elimina un volume (solo se non in uso)
docker volume rm mongodb-data
```

---

## 6. Variabili d'ambiente per MongoDB

Puoi configurare MongoDB usando variabili d'ambiente:

```bash
docker run --name mio-mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -d mongo
```

**Variabili comuni:**

| Variabile | Descrizione |
|-----------|-------------|
| `MONGO_INITDB_ROOT_USERNAME` | Nome utente amministratore |
| `MONGO_INITDB_ROOT_PASSWORD` | Password amministratore |
| `MONGO_INITDB_DATABASE` | Database da creare all'avvio |

⚠️ **Nota**: con autenticazione attiva, dovrai connetterti con credenziali:

```bash
mongosh "mongodb://admin:password123@localhost:27017"
```

---

## 7. Accesso al container

### 7.1 Eseguire comandi nel container

```bash
# Esegui mongosh all'interno del container
docker exec -it mio-mongodb mongosh
```

**Parametri:**
- `docker exec`: esegue un comando in un container in esecuzione
- `-it`: modalità interattiva con terminale
- `mio-mongodb`: nome del container
- `mongosh`: comando da eseguire

### 7.2 Shell del container

Per accedere alla shell Bash del container:

```bash
docker exec -it mio-mongodb bash
```

Una volta dentro, puoi usare comandi Linux e `mongosh`:

```bash
root@a1b2c3d4e5f6:/# mongosh
root@a1b2c3d4e5f6:/# exit
```

---

## 8. Gestione del container

### 8.1 Comandi essenziali

```bash
# Ferma il container
docker stop mio-mongodb

# Avvia il container (se già creato)
docker start mio-mongodb

# Riavvia il container
docker restart mio-mongodb

# Visualizza i log del container
docker logs mio-mongodb

# Visualizza i log in tempo reale
docker logs -f mio-mongodb

# Mostra informazioni dettagliate
docker inspect mio-mongodb

# Elimina il container (deve essere fermato prima)
docker stop mio-mongodb
docker rm mio-mongodb
```

---

## 9. Docker Compose

**Docker Compose** è uno strumento per definire e gestire applicazioni Docker multi-container usando un file YAML.

### 9.1 Perché usare Docker Compose?

✅ Configurazione dichiarativa in un file  
✅ Avvio con un singolo comando  
✅ Facile gestione di più container (MongoDB + app + Redis, ecc.)  
✅ Configurazione versionabile (Git)

### 9.2 Installazione di Docker Compose

**Windows e macOS**: incluso in Docker Desktop

**Linux**:
```bash
sudo apt install docker-compose-plugin
```

Verifica:
```bash
docker compose version
```

### 9.3 File `docker-compose.yml` per MongoDB

Crea un file `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: mio-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb-data:/data/db

volumes:
  mongodb-data:
```

Versione alternativa con cartella locale `volumes/mongodb-data` (nella stessa directory del file `docker-compose.yml`):

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: mio-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - ./volumes/mongodb-data:/data/db
```

**Spiegazione:**
- `version`: versione della sintassi Docker Compose
- `services`: definisce i container da eseguire
- `mongodb`: nome del servizio
- `image`: immagine Docker da usare
- `restart: always`: riavvia automaticamente il container se si ferma
- `volumes`: definisce i volumi per la persistenza

### 9.4 Avviare MongoDB con Docker Compose

```bash
# Avvia i servizi (nella cartella con docker-compose.yml)
docker compose up -d

# Ferma i servizi
docker compose down

# Visualizza i log
docker compose logs -f

# Ferma e rimuovi anche i volumi (⚠️ cancella i dati!)
docker compose down -v
```

### 9.5 MongoDB + Mongo Express (GUI web)

Puoi aggiungere **Mongo Express**, un'interfaccia web per MongoDB:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: mio-mongodb
    restart: always
    ports:
      - "27017:27017"
    env_file:
      - .env
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - ./volumes/mongodb-data:/data/db

  mongo-express:
    image: mongo-express:latest
    container_name: mongo-express
    restart: always
    ports:
      - "8081:8081"
    env_file:
      - .env
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: ${MONGO_ROOT_USERNAME}
      ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGO_ROOT_PASSWORD}
      ME_CONFIG_MONGODB_URL: mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/
    depends_on:
      - mongodb
```

Esempio di file `.env` (nella stessa cartella del `docker-compose.yml`):

```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
```

Perché usare `.env`:
- evita di scrivere password in chiaro nel file `docker-compose.yml`
- rende più semplice cambiare credenziali tra ambienti diversi (sviluppo/test/produzione)
- riduce il rischio di pubblicare accidentalmente password nel repository

**Avvia:**

```bash
docker compose up -d
```

**Accedi a Mongo Express:**  
Apri il browser su [http://localhost:8081](http://localhost:8081)

---

## 10. Connessione da mongosh esterno

Se hai `mongosh` installato sul tuo sistema, puoi connetterti al container:

```bash
# Senza autenticazione
mongosh "mongodb://localhost:27017"

# Con autenticazione
mongosh "mongodb://admin:password123@localhost:27017"
```

---

## 11. Best practices

### 11.1 Sviluppo

✅ Usa `docker-compose.yml` per configurazioni riproducibili  
✅ Usa volumi per persistere i dati  
✅ Esponi solo le porte necessarie  
✅ Usa variabili d'ambiente per le credenziali (mai hardcoded!)

### 11.2 Produzione

✅ Usa tag di versione specifici (es. `mongo:7.0.5` invece di `mongo:latest`)  
✅ Limita le risorse (CPU, memoria) con `deploy.resources`  
✅ Usa orchestrazione (Docker Swarm o Kubernetes)  
✅ Backup regolari dei volumi  
✅ Monitora i log e le metriche

---

## 12. Esempio completo con applicazione Node.js

File `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: app-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secret
    volumes:
      - mongodb-data:/data/db
    networks:
      - app-network

  app:
    build: .
    container_name: node-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://admin:secret@mongodb:27017/mydb?authSource=admin
    depends_on:
      - mongodb
    networks:
      - app-network

volumes:
  mongodb-data:

networks:
  app-network:
    driver: bridge
```

---

## 13. Troubleshooting

### Problema: Porta già in uso

**Errore:**
```
Error: port is already allocated
```

**Soluzione:**
Cambia la porta host:
```bash
docker run -p 27018:27017 -d mongo
```

### Problema: Container si ferma immediatamente

**Diagnosi:**
```bash
docker logs mio-mongodb
```

**Soluzioni comuni:**
- Controlla i log per errori
- Verifica che non ci siano conflitti di porta
- Assicurati che il volume sia scrivibile

### Problema: Connessione rifiutata

**Verifica:**
```bash
# Container in esecuzione?
docker ps

# Porta esposta?
docker port mio-mongodb
```

---

## Riepilogo

In questo capitolo hai imparato:

✅ I vantaggi di usare Docker per MongoDB  
✅ Come installare Docker sul tuo sistema  
✅ Come eseguire MongoDB in un container con `docker run`  
✅ Come persistere i dati con volumi Docker  
✅ Come configurare MongoDB con variabili d'ambiente  
✅ Come usare Docker Compose per orchestrare MongoDB  
✅ Come connetterti al container da `mongosh`  
✅ Best practices per sviluppo e produzione

Nel prossimo capitolo, esplorerai i comandi fondamentali di `mongosh` per creare database, collezioni e documenti.

---

## Esercizi

Vai alla cartella [esercizi/](./esercizi/) per mettere in pratica i concetti appresi!
