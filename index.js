const mineflayer = require('mineflayer')
const express = require('express')
const app = express()

// Render'ın uyumaması için web portu
const port = process.env.PORT || 3000
app.get('/', (req, res) => res.send('Bot Sistemi Aktif!'))
app.listen(port, () => console.log(`Web sunucusu ${port} portunda dinleniyor.`))

function createBot() {
    const bot = mineflayer.createBot({
        host: 'turbolumc.mcsh.io', // Senin verdiğin yeni adres
        port: 12010,               // Loglarda gördüğüm port
        username: 'AntiAFK_Bot',
        version: false,            // Sunucu sürümünü otomatik algılar
        checkTimeoutInterval: 90000 // Bağlantı kopmalarına karşı daha sabırlı olur
    })

    bot.on('spawn', () => {
        console.log('✅ Bot başarıyla giriş yaptı ve spawn oldu!')
        
        // Botun atılmaması için görünmezlik ve güvenli bölgeye ışınlanma
        bot.chat('/effect give AntiAFK_Bot invisibility infinite 255 true')
        bot.chat('/tp AntiAFK_Bot 0 150 0') // Spawn merkezinin yukarısı genellikle güvenlidir
        
        // Periyodik hareket (Kafasını çevirip zıplar, böylece sunucu botu canlı sayar)
        setInterval(() => {
            bot.setControlState('jump', true)
            setTimeout(() => bot.setControlState('jump', false), 500)
            bot.look(bot.entity.yaw + 0.1, bot.entity.pitch)
        }, 20000)
    })

    bot.on('end', (reason) => {
        console.log(`⚠️ Bağlantı kesildi: ${reason}. 20 saniye sonra tekrar denenecek...`)
        setTimeout(createBot, 20000)
    })

    bot.on('error', (err) => {
        console.log(`❌ Hata: ${err.message}`)
    })
}

createBot()
