const fs = require('fs');

const filePath = 'nodejs/sample.txt';

// Async File Read
fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (!err) {
                console.log('Async:\n', data);
            }
        });
    }
});


// Sync File Read
let data;
if (fs.existsSync(filePath)) {
    data = fs.readFileSync(filePath, {encoding:'utf8', flag:'r'});
}
console.log('Sync:\n', data);