const mineflayer = require('mineflayer')
const express = require('express')
const app = express()

const port = process.env.PORT || 3000
app.get('/', (req, res) => res.send('AntiAFK Botu Aktif!'))
app.listen(port, () => console.log(`Server ${port} portunda hazır.`))

function createBot() {
    const bot = mineflayer.createBot({
        host: 'turbolumc.mcserver.host', // Burayı tekrar kendi IP'nle kontrol et
        port: 25565,
        username: 'AntiAFK_Bot', 
        // Sürümü 'false' yaparsak sunucu neyse ona ayak uydurur
        version: false, 
        // Sunucu gecikmelerine karşı botun toleransını artıralım
        checkTimeoutInterval: 60 * 1000 
    })

    bot.on('spawn', () => {
        console.log('✅ Bot başarıyla giriş yaptı!')
        
        // Dünyanın sonuna çok yakın ama tam sınırda olmayan bir yer (Y=100 güvenlidir)
        bot.chat('/tp AntiAFK_Bot 29999000 100 29999000')
        bot.chat('/effect give AntiAFK_Bot invisibility infinite 255 true')
        
        // Daha sık ve küçük hareketler yaparak sunucuyu "buradayım" diye ikna edelim
        setInterval(() => {
            bot.setControlState('jump', true)
            setTimeout(() => bot.setControlState('jump', false), 500)
            // Botun kendi etrafında hafifçe dönmesini sağla (Keepalive için en iyisidir)
            bot.look(bot.entity.yaw + 0.5, bot.entity.pitch)
        }, 15000) 
    })

    bot.on('end', (reason) => {
        console.log(`⚠️ Bağlantı kesildi (${reason}), 30 saniye sonra tekrar denenecek...`)
        setTimeout(createBot, 30000)
    })

    bot.on('error', (err) => console.log('Hata oluştu:', err))
}

createBot()
