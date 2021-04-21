const express = require('express');
const compression = require('compression'); 
const helmet = require('helmet');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportConfig  = require('./libs/passport'); 

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(compression());

// 세션 활성화 및 passport 연동
app.use(session({
    // screat 정보는 version system에 올리지 말것!!!
    secret: 'asdf;aasadfasdksjdfkl',
    resave: false,
    saveUninitialized: true
})); // 세션 활성화
app.use(flash()); // 일회용 메세지 스택 (내부적으로 저장하다가 사용하면 지움)
app.use(passport.initialize()); // passport 구동
app.use(passport.session()); // 세션 연결
passportConfig(passport); // passport 설정

// routes
const indexRouter = require('./routes/index');
const topicRouter = require('./routes/topic');
const authRouter = require('./routes/auth');
const db = require('./libs/db');

// GET request에 토픽들을 _list에 담는 middleware
app.get('*', (req, res, next) => {
    req._list = db.get('topics').value();
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

app.listen(3000, () => {
    console.log(`Example app listening...`)
});