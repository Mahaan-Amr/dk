// This script creates an initial admin user for the application
// Run with: node scripts/create-admin.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  try {
    // Get MongoDB connection string from environment variables
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/derakhtekherad';
    
    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const adminsCollection = db.collection('admins');
    
    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({});
    if (existingAdmin) {
      console.log('An admin user already exists. Do you want to create another one?');
      const answer = await prompt('Enter yes/no: ');
      if (answer.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.');
        rl.close();
        await client.close();
        return;
      }
    }
    
    // Prompt for admin details
    const username = await prompt('Enter admin username: ');
    const password = await prompt('Enter admin password: ');
    const name = await prompt('Enter admin name: ');
    const email = await prompt('Enter admin email: ');
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create admin user
    const result = await adminsCollection.insertOne({
      username,
      password: hashedPassword,
      name,
      email,
      createdAt: new Date(),
    });
    
    console.log(`Admin user created with ID: ${result.insertedId}`);
    
    // Close connections
    rl.close();
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin user:', error);
    rl.close();
    process.exit(1);
  }
}

// Run the function
createAdmin(); 