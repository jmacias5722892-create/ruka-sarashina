import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'

async function iniciar() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode!== DisconnectReason.loggedOut
            console.log('Conexion cerrada, reconectando:', shouldReconnect)
            if(shouldReconnect) iniciar()
        } else if(connection === 'open') {
            console.log('Ruka lista y conectada!')
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