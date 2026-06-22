const mineflayer = require('mineflayer');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());

// Sitenin çekeceği veri şeması
let sunucuKaynaklari = {
    tps: "Hesaplanıyor...",
    ram: "Hesaplanıyor...",
    status: "Açık"
};

// Web sitesi API uç noktası
app.get('/', (req, res) => {
    res.json(sunucuKaynaklari);
});

app.listen(PORT, () => {
    console.log(`==> Web veri köprüsü ${PORT} portunda aktif.`);
});

// Arkadaşınla çakışmayı önleyen resmi Minecraft Çevrimdışı (Crack) UUID algoritması
function resmiOfflineUUID(isim) {
    return crypto.createHash('md5').update("OfflinePlayer:" + isim).digest("hex").replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}

// Botun yeni gizli ismi (UUID ve Session kilitlenmelerini çözen temiz kimlik)
const botIsmi = 'Kaan_Oyunda'; 

const bot = mineflayer.createBot({
    host: 'turbolular.mcsh.io',
    username: botIsmi,
    version: '1.21.1',       
    viewDistance: 'tiny',
    storage: true,           
    physicsEnabled: true,
    // GİZLİLİK MASKESİ
    clientIdentity: {
        uuid: resmiOfflineUUID(botIsmi)
    },
    brand: 'vanilla' // Sunucuya normal Minecraft Java istemcisi gibi görünür
});

bot.on('login', () => {
    console.log(`==> ${botIsmi} normal oyuncu maskesiyle protokolden geçti.`);
});

bot.on('spawn', () => {
    console.log(`==> ${botIsmi} dünyada doğdu. Giriş zinciri başlatılıyor...`);

    // nLogin lobi ve limbo gecikmelerini aşan zaman ayarlı komut zinciri
    setTimeout(() => {
        bot.chat('/register turboKaan99 turboKaan99');
        console.log("==> Kayit komutu gönderildi.");

        setTimeout(() => {
            bot.chat('/login turboKaan99 turboKaan99');
            console.log("==> Giriş komutu gönderildi.");

            // Giriş yaptıktan sonra Survival/Ana dünyaya aktarımı zorla
            setTimeout(() => {
                bot.chat('/server survival'); 
                bot.chat('/main');
                console.log("==> Aktarım komutları gönderildi.");
            }, 3000);

        }, 3000); 
    }, 5000); 

    // İNSANSI HAREKET SİMÜLASYONU
    // Şüphe çekmemek için her 8-12 saniyede bir kafasını rastgele açılarla oynatır
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

// GELİŞMİŞ SPARK MESAJ AYRIŞTIRICI (REGEX VE LOG DESTEKLİ)
function veriAyristir(mesaj) {
    // Spark'tan herhangi bir çıktı geliyorsa canlı canlı Render konsoluna bas
    if (mesaj.includes("1m:") || Array.isArray(mesaj.match(/tps/i)) || mesaj.includes("Memory:") || mesaj.includes("Hafıza:")) {
        console.log("==> Spark'tan Yakalanan Ham Çıktı:", mesaj);
    }

    // TPS Ayıklayıcı (Regex formatı ile tüm sayısal varyasyonları yakalar)
    if (mesaj.includes("1m:") || mesaj.includes("1dk:")) {
        try {
            const tpsEslesme = mesaj.match(/(?:1m:|1dk:)\s*([0-9.]+)/);
            if (tpsEslesme && tpsEslesme[1]) {
                sunucuKaynaklari.tps = tpsEslesme[1];
                console.log(`[BAŞARILI] Sitedeki TPS Güncellendi: ${sunucuKaynaklari.tps}`);
            }
        } catch (e) {
            console.log("TPS Regex hatası:", e.message);
        }
    }

    // RAM Ayıklayıcı (Hafıza / Memory satırını doğrudan yakalar)
    if (mesaj.includes("Memory:") || mesaj.includes("Hafıza:")) {
        try {
            const ramKismi = mesaj.includes("Memory:") ? mesaj.split("Memory:")[1] : mesaj.split("Hafıza:")[1];
            if (ramKismi) {
                sunucuKaynaklari.ram = ramKismi.trim();
                console.log(`[BAŞARILI] Sitedeki RAM Güncellendi: ${sunucuKaynaklari.ram}`);
            }
        } catch (e) {
            console.log("RAM Ayrıştırma hatası:", e.message);
        }
    }
}

// Hem normal sohbet hem de sistem mesaj kanallarını dinliyoruz
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
