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

const bot = mineflayer.createBot({
    host: 'turbolular.mcsh.io',
    username: 'doblofar',
    version: '1.21.1', 
    viewDistance: 'tiny',
    storage: false,
    physicsEnabled: false 
});

bot.on('spawn', () => {
    console.log("==> doblofar oyuna girdi!");

    setTimeout(() => {
        bot.chat('/register doblofar doblofar');
        console.log("==> Kayit komutu gonderildi.");

        setTimeout(() => {
            bot.chat('/login doblofar doblofar');
            console.log("==> Giris komutu gonderildi.");
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

// HEM SOHBET HEM DE SISTEM MESAJLARINI AYRI AYRI YAKALAYAN GÜNCEL KISIM
function veriAyristir(mesaj) {
    // TPS Bilgisi (Örn: TPS from Last 1m: 19.95 veya Last 1m: 20.0)
    if (mesaj.includes("Last 1m:") || mesaj.includes("TPS from Last 1m:")) {
        try {
            const tpsKismi = mesaj.split("1m:")[1].split(",")[0].trim();
            // Renk kodları veya ekstra semboller varsa temizle
            sunucuKaynaklari.tps = tpsKismi.replace(/[^\d.]/g, ''); 
        } catch (e) {
            console.log("TPS ayrıştırılamadı.");
        }
    }

    // RAM Bilgisi (Örn: Memory: 2.1 GB / 4.0 GB (52%))
    if (mesaj.includes("Memory:") || mesaj.includes("Hafıza:")) {
        try {
            const ramKismi = mesaj.split("Memory:")[1] ? mesaj.split("Memory:")[1].trim() : mesaj.split("Hafıza:")[1].trim();
            sunucuKaynaklari.ram = ramKismi;
        } catch (e) {
            console.log("RAM ayrıştırılamadı.");
        }
    }
}

// 1. Kanat: Normal Sohbet Mesajlarını Dinle
bot.on('message', (jsonMsg) => {
    veriAyristir(jsonMsg.toString());
});

// 2. Kanat: Spark gibi eklentilerin bota özel attığı Sistem Mesajlarını Dinle
bot.on('systemChat', (jsonMsg) => {
    veriAyristir(jsonMsg.toString());
});

bot.on('error', (err) => console.log('Hata:', err.message));
bot.on('kicked', (reason) => console.log('Atildi:', JSON.stringify(reason)));
bot.on('end', () => {
    console.log("Baglanti koptu. 10 saniye sonra restart...");
    setTimeout(() => process.exit(1), 10000);
});
