const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = process.env.PORT || 3001

console.log(`🔧 Configuración del servidor:`);
console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - Puerto asignado: ${port}`);
console.log(`   - Hostname: ${hostname}`);
console.log(`   - Railway Environment: ${process.env.RAILWAY_ENVIRONMENT ? 'SÍ' : 'NO'}`);

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('❌ Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error('❌ Error del servidor:', err)
      process.exit(1)
    })
    .listen(port, hostname, () => {
      console.log(`🚀 Frontend corriendo en http://${hostname}:${port}`)
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`📡 Railway Mode: ${process.env.RAILWAY_ENVIRONMENT ? 'ACTIVO' : 'LOCAL'}`)
      console.log(`🔗 Backend API: ${process.env.NEXT_PUBLIC_API_URL || 'No configurado'}`)
    })
})