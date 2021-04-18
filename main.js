const express = require('express');
const app = express();
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session')
const FileStore = require('session-file-store')(session);
const indexRouter = require('./routes/index');
const topicRouter = require('./routes/topic');
const authRouter = require('./routes/auth');

const port = 3000

// also check if dependencies are secure by type npm audit
app.use(helmet());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(session({
    // screat 정보는 version system에 올리지 말것!!!
    secret: 'asdf;aasadfasdksjdfkl',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));

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
app.use('/auth', authRouter);

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