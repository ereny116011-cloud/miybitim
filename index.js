const mineflayer = require('mineflayer');
const http = require('http');

// 1. RENDER.COM PORT HATASI ÇÖZÜMÜ
http.createServer((req, res) => {
    res.write('TurboluMC Botu Aktif!');
    res.end();
}).listen(10000);

// 2. BOT AYARLARI
const bot = mineflayer.createBot({
    host: 'turbolu.mcsh.io',
    username: 'doblofar',
    version: '1.21.1', // Sunucun 26.1.2 olsa da ViaVersion sayesinde bu stabil kalabilir
    viewDistance: 'tiny',
    storage: false,
    physicsEnabled: false // Internet sömürüsünü engellemek için fizikleri kapattık
});

// 3. OTOMATIK GIRIS VE TEMIZLIK
bot.on('spawn', () => {
    console.log("==> doblofar oyuna girdi!");

    // KOMUT SIRALAMASI
    setTimeout(() => {
        // chat fonksiyonunu susturduğun satırı sildim, yoksa bu komutlar gitmez!
        bot.chat('/register doblofar doblofar');
        console.log("==> Kayit komutu gonderildi.");

        setTimeout(() => {
            bot.chat('/login doblofar doblofar');
            console.log("==> Giris komutu gonderildi.");
        }, 3000); // Kayıttan 3 saniye sonra giriş yap
    }, 5000); // Oyuna girdikten 5 saniye sonra başla (EAGAIN hatasını önlemek için)

    // Her 2 dakikada bir RAM ve Dünya temizliği
    setInterval(() => {
        if (bot.world && bot.world.columnCount > 0) {
            bot.world.clearColumnCache(); // Daha güvenli ve hızlı temizleme yolu
            console.log("==> Dunya onbellegi temizlendi.");
        }
        
        if (global.gc) {
            global.gc(); 
        }
    }, 120000);
});

// 4. HATA YÖNETİMİ
bot.on('error', (err) => console.log('Hata:', err.message));
bot.on('kicked', (reason) => console.log('Atildi:', JSON.stringify(reason)));
bot.on('end', () => {
    console.log("Baglanti koptu. 10 saniye sonra restart...");
    setTimeout(() => process.exit(1), 10000);
});
