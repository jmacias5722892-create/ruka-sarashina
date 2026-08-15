const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
async function iniciar(){
 const { state, saveCreds } = await useMultiFileAuthState('ruka')
 const sock = makeWASocket({ auth: state })
 sock.ev.on('creds.update', saveCreds)
 sock.ev.on('messages.upsert', async m => {
  const msg = m.messages[0]
  if(!msg.message) return
  const id = msg.key.remoteJid
  const texto = (msg.message.conversation || msg.message.extendedTextMessage?.text || "")
  if(texto.toLowerCase().includes("ruka")){
    await sock.sendMessage(id, { text: "Hola soy Ruka, en que te ayudo?" })
  }
 })
 console.log("Ruka lista")
}
iniciar()