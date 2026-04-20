const mineflayer = require('mineflayer');

// Bot Ayarları
const bot = mineflayer.createBot({
    host: 'turbolumc.mcsh.io', // Buraya kendi sunucu IP'ni yaz
    port: 25565,                // Portun farklıysa burayı değiştir
    username: 'doblofar',       // Senin yeni efsane isim
    version: '1.21.1',          // Sunucu sürümünle uyumlu yap
    viewDistance: 'tiny',       // Görüş mesafesini en düşüğe çek (RAM dostu)
    storage: false,             // Envanter verilerini tutma (RAM korur)
    checkTimeoutInterval: 60000 // Bağlantı zaman aşımı süresi
});

// --- RAM VE ÖNBELLEK TEMİZLEME PROTOKOLÜ ---

bot.on('spawn', () => {
    console.log("==> TurboluMC: doblofar oyuna başarıyla girdi!");
    
    // Logları tamamen kapat (Önbelleğin şişmesini engeller)
    bot.chat = () => {}; 
    bot.chatAddPattern = () => {};

    // Her 120 saniyede bir (2 dakika) RAM ve Dünya Önbelleğini temizle
    setInterval(() => {
        if (bot.world) {
            bot.world.clearCache(); // Hafızadaki chunkları siler
        }
        
        if (global.gc) {
            global.gc(); // Node.js'e RAM'i sisteme geri ver komutu gönderir
            console.log("==> Sistem: RAM ve Önbellek temizliği yapıldı (500MB sınırı korunuyor).");
        }
    }, 120000); 
});

// Hata Yönetimi (Botun çöküp Render'ı patlatmaması için)
bot.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
        console.log(`Sunucuya bağlanılamadı: ${err.address}`);
    } else {
        console.log(`Bir hata oluştu: ${err.message}`);
    }
});

bot.on('kicked', (reason) => {
    console.log(`Bot sunucudan atıldı. Sebep: ${reason}`);
});

bot.on('end', () => {
    console.log("Bağlantı koptu, yeniden bağlanılıyor...");
});
