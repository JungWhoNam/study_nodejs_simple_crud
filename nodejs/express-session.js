var express = require('express')
var session = require('express-session')

// compatible session store의 한 예
// default는 서버 컴터 메모리에 저장 (문제점: 서버 restart 되면 session에 대한 정보는 사라짐)
// 따라서 'session-file-store'는 쿠키를 파일에 저장
// 작동 방법??? a client의 reqest header 중 Cookie에 파일명을 보냄
// session-file-store는 그거를 보고 sessions 폴더에 파일이 찾아서 req.session에 정보를 넣어줌
var FileStore = require('session-file-store')(session);

var app = express()

app.use(session({
    // screat 정보는 version system에 올리지 말것!!!
    secret: '',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}))

app.get('/', function (req, res, next) {
    // res.session 'express-session' middleware가 추가하는 객채
    // 'express-session'과 호환 가능한 모듈을 사용하면 session이 메모리에서의 접속이 아닌...
    // 클라이언트의 세선 정보를 file이나 MySQL 같은 db에서 가져올 수 있다.
    console.log(req.session);

    if (req.session.num === undefined) {
        req.session.num = 1;
    }
    else {
        req.session.num += 1;
    }

    res.send(`Views : ${req.session.num}`);
})

app.listen(3000, () => {
    console.log('listing...')
});