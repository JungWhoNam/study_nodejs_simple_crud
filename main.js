const express = require('express');
const app = express();
const fs = require('fs');
const compression = require('compression');
const indexRouter = require('./routes/index');
const topicRouter = require('./routes/topic');

const port = 3000

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(compression());

// GET request에 데이터 폴더의 경로와 폴더 안의 파일들을 list로 담는 middleware
app.get('*', (req, res, next) => {
    const dirPath = './data';
    req._dirPath = dirPath;
    fs.readdir(dirPath, (err, files) => {
        req._list = files;
        next();
    });
});

// POST request에 새로운 데이터 저장 폴더의 경로를 담는 middleware
app.post('*', (req, res, next) => {
    const dirPath = './data';
    req._dirPath = dirPath;
    next();
});

// routes
app.use('/', indexRouter);
app.use('/topic', topicRouter);

// 위에 있는 middleware에서 req가 handling이 안됨...
app.use((req, res, next) => {
    // page, file, or server not found error
    res.status(404).send('Sorry cannnot find that!');
});

// 인자가 4개면 error handling을 하는 middleware라고 express에서는 약속
app.use((err, req, res, next) => {
    console.error(err.stack);
    // a server-side error code 500
    res.status(500).send('Something broke');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});