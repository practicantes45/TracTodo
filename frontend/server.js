const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = process.env.PORT || 3001

// Cuando estamos en desarrollo, usamos Next.js dev server
// En producción, usamos el servidor personalizado
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, hostname, () => {
      console.log(`🚀 Frontend Ready on http://${hostname}:${port}`)
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`📡 Railway Mode: ${process.env.RAILWAY_ENVIRONMENT ? 'ACTIVO' : 'LOCAL'}`)
    })
})