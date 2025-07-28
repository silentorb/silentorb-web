import { buildSite } from '../src/rendering'

async function startWatching() {
  const chokidar = require('chokidar')
  const watcher = chokidar.watch(['src', 'public'], {
    ignoreInitial: true,
  })

  watcher.on('all', (event: string, path: string) => {
    // console.log(`${new Date().toLocaleTimeString()} - Rebuilding due to ${event} ${path}`)
    buildSite()
  })

  console.log('Watching src')
}

async function startServer() {
  const liveServer = require('live-server')

  const params = {
    root: 'dist', // Set root directory that's being served. Defaults to cwd.
    open: false, // When false, it won't load your browser by default.
    // ignore: 'scss,my/templates', // comma-separated string for paths to ignore
    // file: 'index.html', // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    // wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    // mount: [['/components', './node_modules']], // Mount a directory to a route.
    // logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
    // middleware: [function (req: any, res: any, next: any) {
    //   next();
    // }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
  }
  liveServer.start(params)
}

async function main() {
  await buildSite()
  await startServer()
  await startWatching()
}

main()
