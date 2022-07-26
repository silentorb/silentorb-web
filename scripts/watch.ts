import { buildSite } from '../src/rendering'

const chokidar = require('chokidar')
function watching() {
  const watcher = chokidar.watch(['src', 'public'], {
    ignoreInitial: true,
  })

  watcher.on('all', (event: string, path: string) => {
    // console.log(`${new Date().toLocaleTimeString()} - Rebuilding due to ${event} ${path}`)
    buildSite()
  })

  buildSite()
  console.log('Watching src')
}

function main() {
  watching()
}

main()
