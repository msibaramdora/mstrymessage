import mongoose from 'mongoose'

type ConnectionObject = {
  isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log('Aleardy connected to database')
    return
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || '')
    connection.isConnected = db.connection.readyState
    console.log('Db connected successfully')
  } catch (error) {
    console.log('Database connection faild', error)
    process.exit(1)
  }
}

export default dbConnect
