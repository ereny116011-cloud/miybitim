const bot = mineflayer.createBot({
  host: 'turbolumc.mcsh.io',
  username: 'doblofar',
  viewDistance: 'tiny', // RAM dostu görüş
  storage: false // Eşya verilerini hafızada tutmasın
});

bot.on('spawn', () => {
    // 1. Logları tamamen sustur (Önbellek şişmesin)
    bot.chat = () => {}; 
    
    // 2. Agresif RAM Boşaltma (2 Dakikada bir)
    setInterval(() => {
        if (bot.world) {
            bot.world.clearCache(); // Dünya verilerini sil
        }
        if (global.gc) {
            global.gc(); // Gereksiz RAM'i sisteme geri ver
        }
    }, 120000); // 120 saniye
});

// Hataları loglamasın ama botu da düşürmesin
bot.on('error', () => {});
bot.on('kicked', () => {});
