const sendTelegram = async message => {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    try {
        if (!token || !chatId) {
            console.log("token or chat_id telegram not found")
            return
        }

        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "Markdown"
            })
        })

        if (!res.ok) {
            const err = await res.text()
            console.log(`Telegram API error: ${err}`)
        }
    } catch (error) {}
}

export default sendTelegram
