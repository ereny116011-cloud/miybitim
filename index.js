const mineflayer = require('mineflayer');
const http = require('http');

// 1. RENDER.COM PORT HATASINI ÇÖZMEK İÇİN SAHTE SERVER
// Render'ın "No open ports detected" diyerek botu kapatmasını engeller.
http.createServer((req, res) => {
    res.write('TurboluMC Botu Aktif!');
    res.end();
}).listen(10000);

// 2. BOT AYARLARI
const bot = mineflayer.createBot({
    host: 'crafteren.mcsh.io',
    username: 'doblofar',
    version: '1.21.1', // 1.21.1 olarak ayarlandı
    viewDistance: 'tiny',
    storage: false,
});

// 3. RAM VE ÖNBELLEK TEMİZLEME
bot.on('spawn', () => {
    console.log("==> TurboluMC: doblofar oyuna basariyla girdi!");
    
    // Logları sustur (Önbellek şişmesin)
    bot.chat = () => {}; 
    bot.chatAddPattern = () => {};

    // Her 2 dakikada bir Chunkları ve RAM'i temizle
    setInterval(() => {
        if (bot.world && bot.world.getColumns) {
            const columns = bot.world.getColumns();
            columns.forEach(column => {
                bot.world.unloadColumn(column.x, column.z);
            });
            console.log("==> Dunya onbellegi temizlendi.");
        }
        
        if (global.gc) {
            global.gc(); 
            console.log("==> RAM sisteme geri verildi (500MB siniri korundu).");
        }
    }, 120000);
});

// 4. HATA YÖNETİMİ
bot.on('error', (err) => console.log('Hata Mesaji:', err.message));

bot.on('kicked', (reason) => {
    console.log('Bot sunucudan atildi. Sebep:', JSON.stringify(reason));
});

bot.on('end', () => {
    console.log("Baglanti koptu. 10 saniye sonra yeniden baslatiliyor...");
    setTimeout(() => {
        process.exit(1); // Render'ın botu otomatik restart etmesini sağlar
    }, 10000);
});
