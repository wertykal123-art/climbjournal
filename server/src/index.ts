import app from './app.js'
import { config } from './config/index.js'
import { prisma } from './models/prisma.js'

async function main() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Database connected successfully')

    // Start server
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`)
      console.log(`Environment: ${config.nodeEnv}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

main()
