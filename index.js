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

// Resmi Minecraft Offline UUID algoritması
function resmiOfflineUUID(isim) {
    return crypto.createHash('md5').update("OfflinePlayer:" + isim).digest("hex").replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}

// İsmi tamamen bağımsız ve sıradan bir oyuncu ismi yaptık (UUID Çakışmasını Sıfırlar)
const botIsmi = 'Kaan_Oyunda'; 

const bot = mineflayer.createBot({
    host: 'turbolular.mcsh.io',
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
    console.log(`==> ${botIsmi} normal oyuncu maskesiyle sunucuya girdi.`);
});

bot.on('spawn', () => {
    console.log(`==> ${botIsmi} dünyada doğdu.`);

    setTimeout(() => {
        // Yeni isim için tertemiz kayıt komutları (Şifreyi de benzersiz yaptık)
        bot.chat('/register turboKaan99 turboKaan99');
        console.log("==> Kayit komutu gonderildi.");

        setTimeout(() => {
            bot.chat('/login turboKaan99 turboKaan99');
            console.log("==> Giris komutu gonderildi.");

            setTimeout(() => {
                bot.chat('/server survival'); 
                bot.chat('/main');
                console.log("==> Aktarım komutları gönderildi.");
            }, 3000);

        }, 3000); 
    }, 5000); 

    // İnsani kafayı çevirme simülasyonu
    setInterval(() => {
        if (bot && bot.entity) {
            const rastgeleYaw = (Math.random() * 360 - 180) * (Math.PI / 180);
            const rastgelePitch = (Math.random() * 40 - 20) * (Math.PI / 180);
            bot.look(rastgeleYaw, rastgelePitch, true);
        }
    }, Math.floor(Math.random() * 4000) + 8000);

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

bot.on('error', (err) => console.log('Hata:', err.message));
bot.on('kicked', (reason) => console.log('Atildi. Sebep:', JSON.stringify(reason)));
bot.on('end', () => {
    setTimeout(() => process.exit(1), 10000);
});
