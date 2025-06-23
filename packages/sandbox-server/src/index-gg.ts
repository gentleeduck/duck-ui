import { generateKeyPairSync, publicEncrypt, privateDecrypt } from 'node:crypto'

// 1. Generate recipient's key pair
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
})

// 2. Sender encrypts the message using recipient's PUBLIC key
const message = 'Hello, this is a secret!'
const encrypted = publicEncrypt(publicKey, Buffer.from(message))

console.log('🔐 Encrypted:', encrypted.toString('base64'))

// 3. Receiver decrypts the message using their PRIVATE key
const decrypted = privateDecrypt(privateKey, encrypted)

console.log('🔓 Decrypted:', decrypted.toString())
