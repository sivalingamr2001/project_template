const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

console.log('Running Knip to collect the fresh list of unused files... 🔍');

// Runs the exact knip command you ran
exec('npx knip --production', (error, stdout, stderr) => {
  const lines = stdout.split('\n');
  const filesToDelete = [];
  let isReadingFiles = false;

  // Parse lines specifically under the "Unused files" header
  for (let line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('Unused files')) {
      isReadingFiles = true;
      continue;
    }
    
    // Stop reading when moving to the next section (Dependencies, Exports, etc.)
    if (isReadingFiles && (trimmed.startsWith('Unused dependencies') || trimmed.startsWith('Unlisted dependencies') || trimmed.length === 0 && filesToDelete.length > 0)) {
      isReadingFiles = false;
      break;
    }

    if (isReadingFiles && trimmed) {
      // Extract the file path (ignoring trailing whitespace/columns)
      const filePath = trimmed.split(/\s+/)[0]; 
      if (filePath && filePath.startsWith('src/')) {
        filesToDelete.push(filePath);
      }
    }
  }

  if (filesToDelete.length === 0) {
    console.log('✨ No unused files found by Knip.');
    process.exit(0);
  }

  console.log(`\nFound ${filesToDelete.length} unused files to delete:`);
  filesToDelete.forEach((file, index) => console.log(`  [${index + 1}] ${file}`));

  // Setup Prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\n⚠️ Are you sure you want to delete these files permanently? (yes/no): ', (answer) => {
    const formattedAnswer = answer.trim().toLowerCase();

    if (formattedAnswer === 'yes' || formattedAnswer === 'y') {
      console.log('\nDeleting files...');
      let deletedCount = 0;

      filesToDelete.forEach((file) => {
        const fullPath = path.resolve(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`❌ Deleted: ${file}`);
          deletedCount++;
        }
      });

      console.log(`\nCleanup complete! Success fully removed ${deletedCount} files. 🎉`);
    } else {
      console.log('\nAction canceled. No files were harmed. 🛑');
    }

    rl.close();
  });
});
