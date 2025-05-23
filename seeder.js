import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

// Create interface for reading user input
const rl = readline.createInterface({ input, output });

// Password strength validation
function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  const checks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  
  const passed = Object.values(checks).filter(Boolean).length;
  
  if (passed < 3) {
    return 'Password must contain at least 3 of the following: uppercase letters, lowercase letters, numbers, special characters';
  }
  
  return null; // No error
}

// Email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Please enter a valid email address';
}

async function createAdmin() {
  try {
    console.log(chalk.blue.bold('\n=== Admin User Creation Script ===\n'));
    
    // Get API URL
    const apiUrl = await rl.question(chalk.cyan('Enter API URL (default: http://localhost:3000/api/auth/seed/admin): '));
    const url = apiUrl || 'http://localhost:3000/api/auth/seed/admin';
    
    // Get admin secret - try environment variable first
    let adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      console.log(chalk.yellow('⚠️  ADMIN_SECRET not found in environment variables'));
      adminSecret = await rl.question(chalk.cyan('Enter admin secret: '));
      
      if (!adminSecret) {
        console.error(chalk.red('❌ Admin secret is required'));
        return;
      }
    } else {
      console.log(chalk.green('✅ Using ADMIN_SECRET from environment variables'));
    }
    
    // Get admin credentials
    const name = await rl.question(chalk.cyan('Enter admin name (default: Admin User): '));
    
    // Email with validation
    let email;
    let emailError;
    do {
      email = await rl.question(chalk.cyan('Enter admin email (default: admin@example.com): '));
      email = email || 'admin@example.com';
      emailError = validateEmail(email);
      if (emailError) {
        console.log(chalk.red(`❌ ${emailError}`));
      }
    } while (emailError);
    
    // Password with validation
    let password;
    let passwordError;
    do {
      password = await rl.question(chalk.cyan('Enter admin password: '));
      password = password || 'SecurePa$$w0rd';
      passwordError = validatePassword(password);
      if (passwordError) {
        console.log(chalk.red(`❌ ${passwordError}`));
      }
    } while (passwordError);
    
    // Prepare request data
    const adminData = {
      name: name || 'Admin User',
      email,
      password
    };
    
    console.log(chalk.blue('\nCreating admin user with the following details:'));
    console.log(chalk.white(`Name: ${adminData.name}`));
    console.log(chalk.white(`Email: ${adminData.email}`));
    console.log(chalk.white(`Password: ${'*'.repeat(adminData.password.length)}`));
    
    const confirm = await rl.question(chalk.yellow('\nConfirm? (y/n): '));
    if (confirm.toLowerCase() !== 'y') {
      console.log(chalk.yellow('Operation cancelled'));
      return;
    }
    
    // Make the API request
    console.log(chalk.blue('\nSending request to create admin user...'));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': adminSecret
      },
      body: JSON.stringify(adminData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(chalk.green('\n✅ Success!'));
      console.log(chalk.white(`Status: ${response.status}`));
      console.log(chalk.white('Response:'), result);
      
      if (response.status === 201) {
        console.log(chalk.green.bold('\n=== Admin User Created Successfully ==='));
        console.log(chalk.white(`User ID: ${result.userId}`));
        console.log(chalk.white(`Email: ${adminData.email}`));
        console.log(chalk.white(`Password: ${adminData.password}`));
        console.log(chalk.yellow('\nPlease save these credentials in a secure location.'));
      } else {
        console.log(chalk.yellow('\nNote: Admin user might already exist.'));
      }
    } else {
      console.error(chalk.red('\n❌ Error creating admin user:'));
      console.error(chalk.red(`Status: ${response.status}`));
      console.error(chalk.red('Response:'), result);
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ An error occurred:'), error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error(chalk.red('Could not connect to the server. Make sure your API is running.'));
    } else if (error.name === 'SyntaxError') {
      console.error(chalk.red('Invalid response from server. Check your API endpoint.'));
    }
  } finally {
    rl.close();
  }
}

// Run the script
createAdmin();
