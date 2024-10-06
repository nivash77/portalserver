const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/compile', (req, res) => {
    const { code, language } = req.body;
    // Handler for C
 if (language === 'c') {
        const fileName = 'TempCode.c';
        const filePath = path.join(__dirname, 'temp', fileName);
        const executable = path.join(__dirname, 'temp', 'TempCode.exe'); // Use .exe for Windows
    
        // Write C code to a file
        fs.writeFile(filePath, code, (err) => {
            if (err) return res.status(500).send('Error writing C file: ' + err.message);
    
            // Compile C code, specifying the output executable file
            exec(`gcc ${filePath} -o ${executable}`, (compileErr, compileStdout, compileStderr) => {
                if (compileErr) {
                    console.error('C Compilation Error:', compileStderr);
                    return res.status(200).send(`C Compilation Error: ${compileStderr}`);
                }
    
                // Check if executable was created
                    // Execute the compiled C code
                    exec(`"${executable}"`, (runErr, runStdout, runStderr) => {
                        if (runErr) {
                            // Log the error and return it to the client
                            console.error('C Execution Error:', runStderr);
                            return res.status(400).send(`C Execution Error: ${runStderr}`);
                        }
    
                        // Send output back to client
                        res.send(runStdout);
    
                        // Cleanup files
                        cleanupFiles([filePath, executable]); // Ensure you have this function to clean up files
                    });
            });
        });
    }
    
  else {
        res.status(400).send('Unsupported language. Please use "c".');
    }
});

// Function to clean up files after execution
function cleanupFiles(files) {
    files.forEach((file) => {
        fs.unlink(file, (err) => {
            if (err) console.error(`Error cleaning up file: ${file}`, err);
        });
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
