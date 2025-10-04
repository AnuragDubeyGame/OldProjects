#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎥 Video Vault Setup Script');
console.log('============================\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js ${nodeVersion} detected`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js 16 or higher.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm ${npmVersion} detected`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm.');
  process.exit(1);
}

console.log('\n📦 Installing dependencies...\n');

// Install root dependencies
console.log('Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install server dependencies
console.log('\nInstalling server dependencies...');
try {
  execSync('cd server && npm install', { stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
} catch (error) {
  console.error('❌ Failed to install server dependencies');
  process.exit(1);
}

// Install client dependencies
console.log('\nInstalling client dependencies...');
try {
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Failed to install client dependencies');
  process.exit(1);
}

// Create environment files
console.log('\n📝 Creating environment files...');

// Server .env
const serverEnvPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(serverEnvPath)) {
  const serverEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_make_it_long_and_random

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_CREDENTIALS=./google-credentials.json

# Frontend URL (for production)
FRONTEND_URL=http://localhost:3000
`;
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Created server/.env');
} else {
  console.log('ℹ️  server/.env already exists');
}

// Client .env
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = `# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# Supabase Configuration (if needed for client-side)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Created client/.env');
} else {
  console.log('ℹ️  client/.env already exists');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created server/uploads directory');
} else {
  console.log('ℹ️  server/uploads directory already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Set up Google Cloud Platform:');
console.log('   - Create a new project');
console.log('   - Enable YouTube Data API v3');
console.log('   - Enable Google Cloud Video Intelligence API');
console.log('   - Create OAuth 2.0 credentials');
console.log('   - Create a service account and download credentials');
console.log('');
console.log('2. Set up Supabase:');
console.log('   - Create a new project');
console.log('   - Run the SQL commands from README.md to create tables');
console.log('');
console.log('3. Configure environment variables:');
console.log('   - Update server/.env with your credentials');
console.log('   - Update client/.env with your credentials');
console.log('');
console.log('4. Start the development servers:');
console.log('   npm run dev');
console.log('');
console.log('5. Open http://localhost:3000 in your browser');
console.log('');
console.log('📚 For detailed setup instructions, see README.md');
