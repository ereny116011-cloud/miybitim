const mineflayer = require('mineflayer');
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());

let sunucuKaynaklari = {
    tps: "Hesaplanıyor...",
    ram: "Hesaplanıyor...",
    status: "Açık"
};

app.get('/', (req, res) => {
    res.json(sunucuKaynaklari);
});

app.listen(PORT, () => {
    console.log(`==> Web veri köprüsü ${PORT} portunda aktif.`);
});

// NLOGIN GEÇİŞLERİ İÇİN FİZİK VE STORAGE ÖZELLİKLERİNİ AKTİF ETTİK
const bot = mineflayer.createBot({
    host: 'turbolu.mcsh.io',
    username: 'Friend',
    version: false, // Sunucu sürümünü otomatik algılar
    viewDistance: 'tiny',
    storage: true,   // Dünyalar arası geçiş paketlerini hafızada tutması için şart
    physicsEnabled: true // Aktarım portalları ve yerçekimi paketleri için şart
});

bot.on('login', () => {
    console.log("==> doblofar nLogin lobi kapısına ulaştı.");
});

bot.on('spawn', () => {
    console.log("==> doblofar dünyada doğdu, giriş işlemleri başlatılıyor...");

    // nLogin lobi korumasına takılmamak için komut sürelerini optimize ettik
    setTimeout(() => {
        bot.chat('/register doblofar doblofar');
        console.log("==> Kayit komutu gonderildi.");

        setTimeout(() => {
            bot.chat('/login doblofar doblofar');
            console.log("==> Giris komutu gonderildi.");

            // GİRİŞ YAPTIKTAN 3 SANİYE SONRA ANA SUNUCUYA GEÇİŞİ ZORLA
            setTimeout(() => {
                // Eğer sunucuda doğrudan lobi aktarımı yoksa el ile ana dünyaya geçmeyi dener
                bot.chat('/server survival'); 
                bot.chat('/main');
                console.log("==> Ana sunucuya geçiş komutları zorlandı.");
            }, 3000);

        }, 3000); 
    }, 5000); 

    // Her 15 saniyede bir Spark verilerini iste
    setInterval(() => {
        if (bot) {
            bot.chat('/spark tps');
            bot.chat('/spark healthreport'); 
        }
    }, 15000);

    // Her 2 dakikada bir temizlik yap
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

// SPARK MESAJ AYRIŞTIRICI
function veriAyristir(mesaj) {
    if (mesaj.includes("Last 1m:") || mesaj.includes("TPS from Last 1m:")) {
        try {
            const tpsKismi = mesaj.split("1m:")[1].split(",")[0].trim();
            sunucuKaynaklari.tps = tpsKismi.replace(/[^\d.]/g, ''); 
        } catch (e) {
            console.log("TPS ayrıştırılamadı.");
        }
    }

    if (mesaj.includes("Memory:") || mesaj.includes("Hafıza:")) {
        try {
            const ramKismi = mesaj.split("Memory:")[1] ? mesaj.split("Memory:")[1].trim() : mesaj.split("Hafıza:")[1].trim();
            sunucuKaynaklari.ram = ramKismi;
        } catch (e) {
            console.log("RAM ayrıştırılamadı.");
        }
    }
}

bot.on('message', (jsonMsg) => {
    veriAyristir(jsonMsg.toString());
});

bot.on('systemChat', (jsonMsg) => {
    veriAyristir(jsonMsg.toString());
});

bot.on('error', (err) => console.log('Bot Hatası:', err.message));
bot.on('kicked', (reason) => console.log('Bot Sunucudan Atıldı. Sebep:', JSON.stringify(reason)));
bot.on('end', () => {
    console.log("Bağlantı tamamen koptu. 10 saniye sonra yeniden denenecek...");
    setTimeout(() => process.exit(1), 10000);
});
