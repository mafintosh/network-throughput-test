import DHT from '@hyperswarm/dht'
import net from 'net'

const [,,publicKey, ip] = process.argv

const node = new DHT()
const block = Buffer.alloc(4 * 1024 * 1024)

await tcp()

console.log()

await udx()

console.log()
console.log('Done! exiting...')

process.exit()

function udx () {
  console.log('Testing udx throughput... (encrypted)')
  console.log()
  return test(node.connect(Buffer.from(publicKey, 'hex')))
}

function tcp () {
  console.log('Testing tcp throughput... (raw)')
  console.log()
  return test(net.connect(54540, ip))
}

async function test (socket) {
  for (let i = 0; i < 25; i++) socket.write(block)
  socket.end()

  socket.on('error', () => socket.destroy())
  socket.pipe(process.stdout)

  return new Promise(resolve => socket.on('close', resolve))
}

