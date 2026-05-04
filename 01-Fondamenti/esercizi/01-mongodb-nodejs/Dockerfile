# Utilizza l'immagine ufficiale di Node.js versione 20 basata su Alpine Linux
# Alpine è una distribuzione leggera ideale per container Docker
FROM node:20-alpine

# Crea e imposta la directory di lavoro dell'applicazione all'interno del container
# Tutte le operazioni successive avverranno all'interno di questa directory
WORKDIR /usr/src/app

# Copia i file di configurazione delle dipendenze dal volume locale al container
# package*.json corrisponde a package.json e package-lock.json (se presente)
# ./ specifica che i file vanno copiati nella directory di lavoro corrente
COPY volumes/app/package*.json ./

# Installa tutte le dipendenze Node.js specificate in package.json
# Utilizza npm per gestire le dipendenze
RUN npm install

# Copia l'intero codice sorgente dell'applicazione dal volume locale al container
# . rappresenta la directory corrente di lavoro (WORKDIR /usr/src/app)
COPY volumes/app/ .

# Espone la porta 3000 per accedere all'applicazione Node.js dall'esterno del container
# Questa porta deve essere mappata quando si avvia il container
EXPOSE 3000

# Specifica il comando di avvio dell'applicazione quando il container viene eseguito
# Esegue "npm start" come command di default al lancio del container
CMD ["npm", "start"]
