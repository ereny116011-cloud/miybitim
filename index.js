const mineflayer = require('mineflayer');
const express = require('express');
const cors = require('cors'); // Web sitesinin sorunsuz bağlanması için şart
const app = express();

// Render için port ayarı (Render otomatik 10000 portunu atar veya process.env.PORT kullanır)
const PORT = process.env.PORT || 10000;

app.use(cors());

// Web sitesinin çekeceği canlı verilerin varsayılan değerleri
let sunucuKaynaklari = {
    tps: "Hesaplanıyor...",
    ram: "Hesaplanıyor...",
    status: "Açık"
};

// Sitenin veriyi çekeceği endpoint (Ana sayfa)
app.get('/', (req, res) => {
    res.json(sunucuKaynaklari);
});

app.listen(PORT, () => {
    console.log(`==> Web veri köprüsü ${PORT} portunda aktif.`);
});

// BOT AYARLARI
const bot = mineflayer.createBot({
    host: 'turbolu.mcsh.io',
    username: 'doblofar',
    version: '1.21.1', 
    viewDistance: 'tiny',
    storage: false,
    physicsEnabled: false 
});

// OTOMATIK GIRIS VE PERFORMANS DINLEME
bot.on('spawn', () => {
    console.log("==> doblofar oyuna girdi!");

    // KOMUT SIRALAMASI (Kayıt ve Giriş)
    setTimeout(() => {
        bot.chat('/register doblofar doblofar');
        console.log("==> Kayit komutu gonderildi.");

        setTimeout(() => {
            bot.chat('/login doblofar doblofar');
            console.log("==> Giris komutu gonderildi.");
        }, 3000); 
    }, 5000); 

    // Her 15 saniyede bir sunucudan gizlice performans bilgilerini iste
    setInterval(() => {
        if (bot) {
            bot.chat('/spark tps');
            bot.chat('/spark healthreport'); 
        }
    }, 15000);

    // Her 2 dakikada bir RAM ve Dünya temizliği
    setInterval(() => {
        if (bot.world && bot.world.columnCount > 0) {
            bot.world.clearColumnCache(); 
            console.log("==> Dunya onbellegi temizlendi.");
        }
        
        if (global.gc) {
            global.gc(); 
        }
    }, 120000);
});

// SUNUCUDAN GELEN SPARK MESAJLARINI YAKALAMA
bot.on('message', (jsonMsg) => {
    const mesaj = jsonMsg.toString();

    // TPS Bilgisini Ayıkla (Örn: TPS from Last 1m: 19.95)
    if (mesaj.includes("TPS from Last 1m:")) {
        try {
            const tpsKismi = mesaj.split("1m:")[1].split(",")[0].trim();
            sunucuKaynaklari.tps = tpsKismi;
        } catch (e) {
            console.log("TPS ayrıştırılamadı.");
        }
    }

    // RAM Bilgisini Ayıkla (Örn: Memory: 2.1 GB / 4.0 GB (52%))
    if (mesaj.includes("Memory:")) {
        try {
            const ramKismi = mesaj.split("Memory:")[1].trim();
            sunucuKaynaklari.ram = ramKismi;
        } catch (e) {
            console.log("RAM ayrıştırılamadı.");
        }
    }
});

// HATA YÖNETİMİ
bot.on('error', (err) => console.log('Hata:', err.message));
bot.on('kicked', (reason) => console.log('Atildi:', JSON.stringify(reason)));
bot.on('end', () => {
    console.log("Baglanti koptu. 10 saniye sonra restart...");
    setTimeout(() => process.exit(1), 10000);
});
