const fs = require('fs');

const filePath = 'nodejs/sample.txt';

// Getting information for a file
fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (!err) {
                console.log(data);
            }
        });
    }
});