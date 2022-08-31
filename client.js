import DHT from '@hyperswarm/dht'
import net from 'net'

const [,,publicKey, ip] = process.argv

const onlyTCP = process.argv.includes('--only-tcp')
const onlyUDX = process.argv.includes('--only-udx')

const node = new DHT()
const block = Buffer.alloc(4 * 1024 * 1024)

if (!onlyUDX) await tcp()
if (!onlyTCP) await udx()

console.log('Done! exiting...')

process.exit()

async function udx () {
  console.log('Testing udx throughput... (encrypted)')
  console.log()
  await test(node.connect(Buffer.from(publicKey, 'hex')))
  console.log()
}

async function tcp () {
  console.log('Testing tcp throughput... (raw)')
  console.log()
  await test(net.connect(54540, ip))
  console.log()
}

async function test (socket) {
  for (let i = 0; i < 100; i++) socket.write(block)
  socket.end()
  socket.pipe(process.stdout)

  return new Promise((resolve, reject) => {
    socket.on('error', reject)
    socket.on('close', resolve)
  })
}

