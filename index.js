const mineflayer = require('mineflayer')
const express = require('express')
const app = express()

// Render'ın uyumaması için gerekli web arayüzü
const port = process.env.PORT || 3000
app.get('/', (req, res) => res.send('AntiAFK Botu Aktif!'))
app.listen(port, () => console.log(`Server ${port} portunda hazır.`))

function createBot() {
    const bot = mineflayer.createBot({
        host: 'SUNUCU_IP_ADRESIN', // Buraya mcserver.host IP'ni yaz
        port: 25565,
        username: 'AntiAFK_Bot', 
        version: '1.20.1' // Sunucu sürümünü kontrol etmeyi unutma!
    })

    bot.on('spawn', () => {
        console.log('✅ Bot başarıyla giriş yaptı!')
        // Botun ismini gizlemek için takım komutları ve ışınlanma
        bot.chat('/tp AntiAFK_Bot 29999900 100 29999900')
        bot.chat('/effect give AntiAFK_Bot invisibility infinite 255 true')
        
        // AFK kalmamak için hareket döngüsü
        setInterval(() => {
            bot.setControlState('jump', true)
            setTimeout(() => bot.setControlState('jump', false), 500)
        }, 30000)
    })

    // Bağlantı koparsa otomatik yeniden bağlan
    bot.on('end', () => {
        console.log('⚠️ Bağlantı kesildi, 60 saniye sonra tekrar denenecek...')
        setTimeout(createBot, 60000)
    })

    bot.on('error', (err) => console.log('Hata:', err))
}

createBot()