const mineflayer = require('mineflayer')
const express = require('express')
const app = express()

const port = process.env.PORT || 3000
app.get('/', (req, res) => res.send('AntiAFK Botu Hazır!'))
app.listen(port, () => console.log(`Web sunucusu ${port} portunda aktif.`))

function createBot() {
    const bot = mineflayer.createBot({
        host: 'turbolumc.mcsh.io',
        port: 25565,
        username: 'doblofar',
        version: false, // Sunucu sürümünü (1.21.1) otomatik algılar
        checkTimeoutInterval: 60000 
    })

    bot.on('spawn', () => {
        console.log('✅ Bot sunucuya girdi!')
        
        // Botu dünyanın ucundan kurtarıp güvenli bir yere çekelim
        bot.chat('/tp doblofar 0 100 0') 
        
        // Botu hayatta tutmak için küçük hareketler
        setInterval(() => {
            bot.setControlState('jump', true)
            setTimeout(() => bot.setControlState('jump', false), 500)
            // Kafayı hafifçe oynatmak paket akışını sağlar
            bot.look(bot.entity.yaw + 0.2, bot.entity.pitch)
        }, 15000)
    })

    bot.on('end', (reason) => {
        console.log(`⚠️ Bağlantı koptu (${reason}). 20 saniye sonra tekrar bağlanıyor...`)
        setTimeout(createBot, 20000)
    })

    bot.on('error', (err) => console.log('Hata:', err))
}

createBot()
