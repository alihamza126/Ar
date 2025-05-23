import mongoose from 'mongoose';

let isConnected = false; // track the connection

export const connectToDB = async () => {
  mongoose.set('bufferCommands', true);

  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "areesha_lms",
      serverSelectionTimeoutMS: 50000, // 30 seconds timeout
      socketTimeoutMS: 45000 // 45 seconds socket timeout
    })
    isConnected = true;
  } catch (error) {
    console.log(error);
  }
}
