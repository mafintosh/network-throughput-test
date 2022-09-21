import DHT from '@hyperswarm/dht'
import net from 'net'

const [,,publicKey, ip] = process.argv

const onlyTCP = process.argv.includes('--only-tcp')
const onlyUDX = process.argv.includes('--only-udx')

const node = new DHT()
const block = Buffer.alloc(4 * 1024 * 1024)

if (!onlyUDX) await tcp()
if (!onlyTCP) await udx()

console.error('Done! exiting...')

process.exit()

async function udx () {
  console.error('Testing udx throughput... (encrypted)')
  console.error()
  await test(node.connect(Buffer.from(publicKey, 'hex')))
  console.error()
}

async function tcp () {
  console.error('Testing tcp throughput... (raw)')
  console.error()
  await test(net.connect(54540, ip))
  console.error()
}

async function test (socket) {
  for (let i = 0; i < 100; i++) socket.write(block)
  socket.end()
  socket.on('data', data => process.stderr.write(data))

  return new Promise((resolve, reject) => {
    socket.on('error', reject)
    socket.on('close', resolve)
  })
}

