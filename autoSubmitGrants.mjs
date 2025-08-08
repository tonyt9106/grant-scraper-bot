import { exec } from 'child_process';

function runBot() {
  console.log(`⏰ Running grant bot at ${new Date().toLocaleString()}`);

  // This assumes your main script is index.mjs
  exec('node index.mjs', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ Stderr: ${stderr}`);
      return;
    }
    console.log(`✅ Output:\n${stdout}`);
  });
}

// Run every 10 minutes
setInterval(runBot, 10 * 60 * 1000);

// Run immediately once
runBot();
