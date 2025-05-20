// recommendation-service.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Queue to manage recommendation updates
let updateQueue = [];
let isProcessing = false;
let lastUpdateTime = 0;
const UPDATE_COOLDOWN = 120000;

// Function to find the correct Python command
function getPythonCommand() {
  // Check if we're on Windows
  const isWindows = os.platform() === 'win32';
  
  // Try different Python commands based on the platform
  const pythonCommands = isWindows ? 
    ['python', 'python3', 'py'] : 
    ['python3', 'python'];
  
  // Return the first command that exists
  return pythonCommands[0]; // We'll implement actual checking in the spawn call
}

// Function to trigger the Python recommendation script
function runRecommendationSystem() {
  return new Promise((resolve, reject) => {
    console.log('Starting recommendation system update...');
    
    const pythonCommands = os.platform() === 'win32' ? 
      ['python', 'python3', 'py'] : 
      ['python3', 'python'];
    
    // Try each python command
    tryPythonCommand(pythonCommands, 0, resolve, reject);
  });
}

function tryPythonCommand(commands, index, resolve, reject) {
  if (index >= commands.length) {
    reject(new Error("No Python interpreter found. Please install Python and ensure it's in your PATH."));
    return;
  }
  
  const command = commands[index];
  console.log(`Trying Python command: ${command}`);
  
const scriptPath = path.join(__dirname, 'news_recommendation_system.py');
  
  // Check if the script exists
  if (!fs.existsSync(scriptPath)) {
    reject(new Error(`Python script not found at: ${scriptPath}`));
    return;
  }
  
  console.log(`Executing script: ${scriptPath}`);
  
  const pythonProcess = spawn(command, [scriptPath], {
    env: { ...process.env },
    shell: true // This can help with path resolution on Windows
  });
  
  let output = '';
  let errorOutput = '';
  
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log(`Recommendation system: ${data}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.error(`Recommendation system error: ${data}`);
  });
  
  pythonProcess.on('error', (error) => {
    console.error(`Failed to start Python process with command ${command}:`, error);
    // Try the next command
    tryPythonCommand(commands, index + 1, resolve, reject);
  });
  
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Recommendation system update completed successfully');
      lastUpdateTime = Date.now();
      resolve(output);
    } else {
      console.error(`Recommendation system exited with code ${code}`);
      // If it failed with a command not found error, try the next command
      if (code === 127 || code === 9009) { // 127 is command not found on Unix, 9009 on Windows
        tryPythonCommand(commands, index + 1, resolve, reject);
      } else {
        reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
      }
    }
  });
}

// Queue-based system to handle multiple requests
async function processQueue() {
  if (isProcessing || updateQueue.length === 0) return;
  
  isProcessing = true;
  
  try {
    await runRecommendationSystem();
    
    // Resolve all promises in the queue
    updateQueue.forEach(({ resolve }) => resolve());
  } catch (error) {
    // Reject all promises in the queue
    updateQueue.forEach(({ reject }) => reject(error));
  } finally {
    updateQueue = [];
    isProcessing = false;
  }
}

// Public function to queue an update
function queueRecommendationUpdate(userId) {
  console.log(`Queueing recommendation update for user: ${userId}`);
  
  // Check if enough time has passed since the last update
  const timeSinceLastUpdate = Date.now() - lastUpdateTime;
  if (timeSinceLastUpdate < UPDATE_COOLDOWN) {
    console.log(`Skipping recommendation update (cooldown period): ${Math.round(timeSinceLastUpdate/1000)}s since last update`);
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    updateQueue.push({ resolve, reject });
    
    // Start processing the queue
    setTimeout(processQueue, 0);
  });
}

module.exports = {
  queueRecommendationUpdate,
  runRecommendationSystem // Export this for scheduled jobs
};