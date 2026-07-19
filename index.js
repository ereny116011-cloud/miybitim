const mineflayer = require('mineflayer');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
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

function resmiOfflineUUID(isim) {
    return crypto.createHash('md5').update("OfflinePlayer:" + isim).digest("hex").replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}

const botIsmi = 'friendlyboy'; 

const bot = mineflayer.createBot({
    host: 'turbolumc.aternos.me',
    username: botIsmi,
    version: '1.21.1',       
    viewDistance: 'tiny',
    storage: true,           
    physicsEnabled: true,
    clientIdentity: {
        uuid: resmiOfflineUUID(botIsmi)
    },
    brand: 'vanilla' 
});

bot.on('login', () => {
    console.log(`==> ${botIsmi} normal oyuncu maskesiyle protokolden geçti.`);
});

bot.on('spawn', () => {
    console.log(`==> ${botIsmi} dünyada doğdu. Giriş zinciri başlatılıyor...`);

    setTimeout(() => {
        bot.chat('/register turboKaan99 turboKaan99');
        console.log("==> Kayit komutu gönderildi.");

        setTimeout(() => {
            bot.chat('/login turboKaan99 turboKaan99');
            console.log("==> Giriş komutu gönderildi.");

            setTimeout(() => {
                bot.chat('/server survival'); 
                bot.chat('/main');
                console.log("==> Aktarım komutları gönderildi.");
            }, 3000);

        }, 3000); 
    }, 5000); 

    // İnsansı hareket simülasyonu
    setInterval(() => {
        if (bot && bot.entity) {
            const rastgeleYaw = (Math.random() * 360 - 180) * (Math.PI / 180);
            const rastgelePitch = (Math.random() * 40 - 20) * (Math.PI / 180);
            bot.look(rastgeleYaw, rastgelePitch, true);
        }
    }, 10000);

    // Her 15 saniyede bir performans raporu iste
    setInterval(() => {
        if (bot) {
            bot.chat('/spark tps');
            bot.chat('/spark healthreport'); 
        }
    }, 15000);

    // Hafıza temizliği
    setInterval(() => {
        if (bot.world && bot.world.columnCount > 0) {
            bot.world.clearColumnCache(); 
        }
        if (global.gc) {
            global.gc(); 
        }
    }, 120000);
});

// MULTI-LINE (ÇOK SATIRLI) KUSURSUZ YENİ AYRIŞTIRICI SİSTEMİ
let tpsBekleniyor = false;
let ramBekleniyor = false;

function veriAyristir(mesaj) {
    const temizMesaj = mesaj.trim();

    // 1. ADIM: Tetikleyicileri Yakala
    if (temizMesaj.includes("TPS from last 5s")) {
        tpsBekleniyor = true;
        return;
    }
    if (temizMesaj.includes("Memory usage:")) {
        ramBekleniyor = true;
        return;
    }

    // 2. ADIM: İşaretli satır geldiyse veriyi cımbızla çek
    if (tpsBekleniyor) {
        // Yıldızları (*20.0) ve boşlukları temizle, sadece sayıları al
        const tpsSatiri = temizMesaj.replace(/\*/g, '').trim();
        const tpsParçalari = tpsSatiri.split(',');
        
        if (tpsParçalari.length > 0 && !isNaN(parseFloat(tpsParçalari[0]))) {
            sunucuKaynaklari.tps = tpsParçalari[0].trim(); // İlk sıradaki 5s TPS'ini (20.0) alır
            console.log(`[GERÇEK DOĞRULAMA] TPS Başarıyla Güncellendi: ${sunucuKaynaklari.tps}`);
        }
        tpsBekleniyor = false; // Kilidi kapat
    }

    if (ramBekleniyor) {
        if (temizMesaj.includes("GB") || temizMesaj.includes("MB")) {
            // "1.2 GB / 2.8 GB   (42%)" satırından yüzdeyi atıp sadece "1.2 GB / 2.8 GB" kısmını alır
            const ramTemiz = temizMesaj.split("(")[0].trim();
            sunucuKaynaklari.ram = ramTemiz;
            console.log(`[GERÇEK DOĞRULAMA] RAM Başarıyla Güncellendi: ${sunucuKaynaklari.ram}`);
        }
        ramBekleniyor = false; // Kilidi kapat
    }
}

bot.on('message', (jsonMsg) => {
    veriAyristir(jsonMsg.toString());
});

bot.on('systemChat', (jsonMsg) => {
    veriAyristir(jsonMsg.toString());
});

bot.on('error', (err) => console.log('Bot Hatası:', err.message));
bot.on('kicked', (reason) => console.log('Bot Atıldı:', JSON.stringify(reason)));
bot.on('end', () => {
    setTimeout(() => process.exit(1), 10000);
});
