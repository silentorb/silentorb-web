import { buildSite } from '../src/rendering'

const chokidar = require('chokidar')
async function watching() {
  const watcher = chokidar.watch(['src', 'public'], {
    ignoreInitial: true,
  })

  watcher.on('all', (event: string, path: string) => {
    // console.log(`${new Date().toLocaleTimeString()} - Rebuilding due to ${event} ${path}`)
    buildSite()
  })

  await buildSite()
  console.log('Watching src')
}

async function main() {
  await watching()
}

main()
