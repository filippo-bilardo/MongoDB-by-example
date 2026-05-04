// Script di inizializzazione MongoDB
// Viene eseguito solo al primo avvio del container

print('═══════════════════════════════════════════════════════════');
print('   Inizializzazione MongoDB - Esercitazione Primi Passi    ');
print('═══════════════════════════════════════════════════════════');

// Nota: Questo script crea SOLO il database amministratore
// Gli studenti creeranno i propri database durante l'esercitazione

print('✓ Container MongoDB pronto per l\'esercitazione!');
print('✓ Gli studenti possono ora connettersi con mongosh');
print('✓ Nessun database preconfigurato - tutto da creare manualmente');
print('');
print('Per connettersi:');
print('  docker exec -it mongodb_primi_passi mongosh -u admin -p password123');
print('');
print('═══════════════════════════════════════════════════════════');
