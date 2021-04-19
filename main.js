const express = require('express');
const app = express();
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session')
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const indexRouter = require('./routes/index');
const topicRouter = require('./routes/topic');
const authRouter = require('./routes/auth');


const port = 3000
const authData = {
    // version system에 올릴때 password 값을 올리지 말기!!!
    // 또한 값을 암호화해서 개발자도 모르게 해야함
    email: 'jung@gmail.com',
    password: '1234',
    nickname: 'jung'
}

// Check if dependencies are secure by type npm audit
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
app.use(passport.initialize());
app.use(passport.session());

// 로그인에 성공할때 불러지는 콜백 함수
// 성공 시 session-store에 저장
passport.serializeUser(function (user, done) {
    console.log('serialize', user);
    // 입력된 두 번째 인자를 sessions에 데이터의 'user' property에 저장
    done(null, user.email);
});

// 로그인 성공 후 새로운 페이지를 방문할 때마다 불러지는 콜백 함수
// session-store에서 식별자를 가져와서 사용자의 실제 테이터를 가져옴 
passport.deserializeUser(function (id, done) {
    console.log('deserialize', id);
    // 현재 코드는 한명의 유저만 관리하기에 id를 사용해서 search 불필요
    // done 이후 req.user의 객체를 통해 주입된 두 번째 인자의 값을 access함
    done(null, authData);
});

// 로그인에 성공 or 실패를 판별하는 코드
passport.use(new LocalStrategy(
    // by default, LocalStrategy expects parameters named username and password. In our case, we have named these fields differently.
    { // by default
        usernameField: 'email',
        passwordField: 'pwd'
    },
    function (username, password, done) {
        if (username === authData.email) {
            if (password === authData.password) {
                return done(null, authData);
            }
            else {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
        }
        else {
            return done(null, false, {
                message: 'Incorrect username.'
            });
        }
    }
));

// passport는 내부적으로 express-session을 사용하기에 session을 활성화 시킨 다음에 passport가 등장해야 한다...
// 사용자가 로그인 했을때 passport가 정보를 처리하게 하는 코드
app.post('/auth/login_process',
    // login 페이지에서 작성한 form을 passport가 받게함
    passport.authenticate('local', {
        //successRedirect: '/',
        failureRedirect: '/auth/login'
    }),
    // express session으로 session-file-store을 사용중
    // session 정보가 파일에 저장 후 redirection을 하기 위해서...
    // 위에 successRedirect: '/', 주석 처리 및...
    // 밑에 함수를 정의함
    (req, res) => {
        req.session.save((err) => {
            res.redirect('/');
        });
    }
);

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