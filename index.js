const mineflayer = require('mineflayer');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());

// Web sitesine servis edilecek canlı veri şeması
let sunucuKaynaklari = {
    tps: "Hesaplanıyor...",
    ram: "Hesaplanıyor...",
    status: "Açık"
};

// API Uç Noktası
app.get('/', (req, res) => {
    res.json(sunucuKaynaklari);
});

app.listen(PORT, () => {
    console.log(`==> Web veri köprüsü ${PORT} portunda aktif.`);
});

// Arkadaşınla UUID çakışmasını kökten çözen resmi Minecraft Çevrimdışı (Crack) algoritması
function resmiOfflineUUID(isim) {
    return crypto.createHash('md5').update("OfflinePlayer:" + isim).digest("hex").replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}

const botIsmi = 'Kaan_Oyunda'; 

const bot = mineflayer.createBot({
    host: 'turbolu.mcsh.io',
    username: botIsmi,
    version: '1.21.1',       
    viewDistance: 'tiny',
    storage: true,           
    physicsEnabled: true,
    clientIdentity: {
        uuid: resmiOfflineUUID(botIsmi)
    },
    brand: 'vanilla' // Gizlilik: Kendini standart Vanilla Minecraft Java istemcisi olarak tanıtır
});

bot.on('login', () => {
    console.log(`==> ${botIsmi} normal oyuncu maskesiyle protokolden geçti.`);
});

bot.on('spawn', () => {
    console.log(`==> ${botIsmi} dünyada doğdu. Giriş zinciri başlatılıyor...`);

    // nLogin lobi bariyerlerini ve limbo odasını aşan zaman ayarlı komut zinciri
    setTimeout(() => {
        bot.chat('/register turboKaan99 turboKaan99');
        console.log("==> Kayit komutu gönderildi.");

        setTimeout(() => {
            bot.chat('/login turboKaan99 turboKaan99');
            console.log("==> Giriş komutu gönderildi.");

            // Giriş sonrası lobi/limbo dünyasından Survival/Ana dünyaya geçişi zorlar
            setTimeout(() => {
                bot.chat('/server survival'); 
                bot.chat('/main');
                console.log("==> Aktarım komutları gönderildi.");
            }, 3000);

        }, 3000); 
    }, 5000); 

    // İNSANSI HAREKET SİMÜLASYONU
    // Şüphe çekmemek için her 8-12 saniyede bir kafasını insansı refleksle hafifçe oynatır
    setInterval(() => {
        if (bot && bot.entity) {
            const rastgeleYaw = (Math.random() * 360 - 180) * (Math.PI / 180);
            const rastgelePitch = (Math.random() * 40 - 20) * (Math.PI / 180);
            bot.look(rastgeleYaw, rastgelePitch, true);
        }
    }, Math.floor(Math.random() * 4000) + 8000);

    // Her 15 saniyede bir Spark eklentisinden performans raporu talep et
    setInterval(() => {
        if (bot) {
            bot.chat('/spark tps');
            bot.chat('/spark healthreport'); 
        }
    }, 15000);

    // Her 2 dakikada bir RAM ve Dünya Önbelleği temizliği (Render çökmesini önler)
    setInterval(() => {
        if (bot.world && bot.world.columnCount > 0) {
            bot.world.clearColumnCache(); 
        }
        if (global.gc) {
            global.gc(); 
        }
    }, 120000);
});

// SPARK'IN ÇOK SATIRLI TABLOSUNU NOKTA ATIŞI ÇÖZEN YENİ AYRIŞTIRICI
let geciciTpsDurumu = false;
let geciciRamDurumu = false;

function veriAyristir(mesaj) {
    const temizMesaj = mesaj.trim();

    // 1. TPS YAKALAYICI (Sadece doğrudan alt satıra geçen sayıları avlar)
    if (temizMesaj.includes("TPS from last")) {
        geciciTpsDurumu = true; // Bir sonraki satırın TPS sayısı olduğunu işaretle
        return;
    }
    if (geciciTpsDurumu) {
        // Satırdaki ilk virgüllü veya noktalı sayıyı (Son 5s TPS'ini) cımbızla çeker
        const tpsEslesme = temizMesaj.match(/^([0-9.]+)/);
        if (tpsEslesme) {
            sunucuKaynaklari.tps = tpsEslesme[1];
            console.log(`[GERÇEK TPS GÜNCELLENDİ] Sitedeki Yeni TPS: ${sunucuKaynaklari.tps}`);
        }
        geciciTpsDurumu = false;
    }

    // 2. RAM YAKALAYICI (Memory usage satırının hemen altındaki GB verisini avlar)
    if (temizMesaj.includes("Memory usage:")) {
        geciciRamDurumu = true; // Bir sonraki satırın RAM miktarı olduğunu işaretle
        return;
    }
    if (geciciRamDurumu) {
        // Satırdaki "1.2 GB / 2.8 GB" veya "1019.7 MB" kısmını temizce ayıklar
        if (temizMesaj.includes("GB") || temizMesaj.includes("MB")) {
            const ramUfuk = temizMesaj.split("(")[0].trim();
            sunucuKaynaklari.ram = ramUfuk;
            console.log(`[GERÇEK RAM GÜNCELLENDİ] Sitedeki Yeni RAM: ${sunucuKaynaklari.ram}`);
        }
        geciciRamDurumu = false;
    }
}

// Sohbet kanalını ve eklentilerin kullandığı gizli sistem chat paketlerini dinliyoruz
bot.on('message', (jsonMsg) => {
    veriAyristir(jsonMsg.toString());
});

bot.on('systemChat', (jsonMsg) => {
    veriAyristir(jsonMsg.toString());
});

// HATA VE BAĞLANTI KONTROLLERİ
bot.on('error', (err) => console.log('Bot Hatası:', err.message));
bot.on('kicked', (reason) => console.log('Bot Sunucudan Atıldı. Sebep:', JSON.stringify(reason)));
bot.on('end', () => {
    console.log("Bağlantı koptu. 10 saniye sonra otomatik restart atılıyor...");
    setTimeout(() => process.exit(1), 10000);
});
