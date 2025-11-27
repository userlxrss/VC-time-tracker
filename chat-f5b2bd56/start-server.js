const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting VC Time Tracker on port 65432...');

const devServer = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'VC-time-tracker'),
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '65432'
  }
});

devServer.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});

devServer.on('error', (err) => {
  console.error('Failed to start development server:', err);
});