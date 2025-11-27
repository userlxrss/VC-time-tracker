const { spawn, exec } = require('child_process');
const path = require('path');

const vcTrackerPath = path.join(__dirname, 'VC-time-tracker');
console.log('🚀 VC Time Tracker Server Startup');
console.log('📁 Path:', vcTrackerPath);

// Check if .next exists and clear it
const fs = require('fs');
const nextPath = path.join(vcTrackerPath, '.next');
if (fs.existsSync(nextPath)) {
  console.log('🧹 Clearing .next cache...');
  try {
    fs.rmSync(nextPath, { recursive: true, force: true });
    console.log('✅ Cache cleared');
  } catch (err) {
    console.log('⚠️  Cache clear warning:', err.message);
  }
}

// Start the development server
console.log('🌐 Starting Next.js development server on port 65432...');

const child = spawn('npx', ['next', 'dev', '-p', '65432'], {
  cwd: vcTrackerPath,
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`\n🛑 Server process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGTERM');
});

console.log('⏳ Waiting for server to start...');
console.log('📊 The app will be available at: http://localhost:65432');