import DHT from '@hyperswarm/dht'
import net from 'net'
import byteSize from 'tiny-byte-size'

const node = new DHT()
const keyPair = DHT.keyPair(Buffer.alloc(32).fill('throughput-test'))

const udx = node.createServer()
udx.on('connection', onconn('udx'))

await udx.listen(keyPair)

const tcp = net.createServer()

tcp.on('connection', onconn('tcp'))
tcp.listen(54540)

console.log('Listening. To run the client:')
console.log('node client.js ' + keyPair.publicKey.toString('hex') + ' ' + node.host)

const BLOCK = 4 * 1024 * 1024

function onconn (name) {
  return function (socket) {
    let missing = BLOCK
    let recv = 0
    let recvTotal = 0
    let then = Date.now()
    const started = then

    socket.on('data', function (data) {
      missing -= data.byteLength
      recv += data.byteLength
      recvTotal += data.byteLength
      if (missing <= 0) {
        const now = Date.now()
        socket.write(name + ': ' + byteSize.perSecond(recv, now - then) + ' (total ' + byteSize.perSecond(recvTotal,  now - started) + ')\n')
        missing += BLOCK
        recv = 0
        then = now
      }
    })

    socket.on('end', function () {
      socket.end()
    })

    socket.on('error', () => socket.destroy())
  }
}
