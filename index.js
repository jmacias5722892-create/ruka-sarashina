import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function iniciar() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')

    // PIDE EL NUMERO PARA EL CODIGO
    let phoneNumber = await question('Pon tu número con código de país ej: 5218715786936 > ')
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // ya no queremos QR
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    })

    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode(phoneNumber)
        console.log(`\nTU CÓDIGO DE VINCULACIÓN ES: ${code}\n`)
        console.log('En WhatsApp > Dispositivos vinculados > Vincular con número de teléfono')
    }

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode!== DisconnectReason.loggedOut
            console.log('Conexion cerrada, reconectando:', shouldReconnect)
            if(shouldReconnect) iniciar()
        } else if(connection === 'open') {
            console.log('Ruka lista y conectada!')
            rl.close()
        }
    })

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0]
        if(!msg.message) return
        const id = msg.key.remoteJid
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || ""

        if(texto.toLowerCase().includes("ruka")){
            await sock.sendMessage(id, { text: "Hola, soy Ruka! ya estoy activa 🔥" })
        }
    })
}

iniciar()