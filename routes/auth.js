const express = require('express');
const router = express.Router();
const passport = require('passport');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const template = require('../libs/template');
const db = require('../libs/db');

router.get('/login', (req, res, next) => {
    // this flash method checks 'flash' property in 'req.session' and pops all of its messages. 
    let feedback = req.flash('error');

    const title = "WEB - login";
    const list = template.list(req._list, '/topic');
    const html = template.HTML(title, list, `
        <div style="color:red;">${feedback}</div>
        <form action="${req.baseUrl}/login_process" method="post">
            <p><input type="text" name="email" placeholder="email"></p>
            <p><input type="password" name="pwd" placeholder="password"></p>
            <p><input type="submit" value="login"></p>
        </form>
        `, ``);

    res.send(html);
});

// passport는 내부적으로 express-session을 사용하기에 session을 활성화 시킨 다음에 passport가 등장해야 한다...
// 사용자가 로그인 했을때 passport가 정보를 처리하게 하는 코드
router.post('/login_process',
    // login 페이지에서 작성한 form을 passport가 받게함
    passport.authenticate('local', {
        // if success, set req.user
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true,
        successFlash: true
    })
);

router.get('/register', (req, res, next) => {
    // this flash method checks 'flash' property in 'req.session' and pops all of its messages. 
    let feedback = req.flash('error');

    const title = "WEB - register";
    const list = template.list(req._list, '/topic');
    var html = template.HTML(title, list, `
        <div style="color:red;">${feedback}</div>
        <form action="${req.baseUrl}/register_process" method="post">
          <p><input type="text" name="email" placeholder="email"></p>
          <p><input type="password" name="pwd" placeholder="password"></p>
          <p><input type="password" name="pwd2" placeholder="password"></p>
          <p><input type="text" name="displayName" placeholder="display name"></p>
          <p>
            <input type="submit" value="register">
          </p>
        </form>
        `, '');

    res.send(html);
});

router.post('/register_process', (req, res, next) => {
    const post = req.body;
    const { email, pwd, pwd2, displayName } = post;

    // if the input string is empty, null, undefined
    if (!email || !pwd || !pwd2 || !displayName) {
        req.flash('error', 'Field(s) are empty.');
        return res.redirect(`${req.baseUrl}/register`);
    }

    if (pwd !== pwd2) {
        req.flash('error', 'Passwords much be same.');
        return res.redirect(`${req.baseUrl}/register`);
    }

    // if the email already exists...
    if (db.get('users').find({ email: email }).value()) {
        req.flash('error', 'Email is already registered.');
        return res.redirect(`${req.baseUrl}/register`);
    }

    bcrypt.hash(pwd, 10, function (err, hash) {
        const user = {
            id: shortid.generate(),
            email: email,
            password: hash,
            displayName: displayName
        };

        db.get('users').push(user).write();
        req.login(user, (err) => {
            if (err) {
                throw err;
            }
            req.flash('success', 'Email is registered.');
            return res.redirect('/');
        });
    });
});

router.get('/logout', (req, res, next) => {
    // terminate a login session
    req.logout();
    // go back to home
    res.redirect('/');
});


// client가 content server에게 서비스 기능 사용하게 해달라고 요청
// login google 버튼 클릭시 실행
router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    }));

// 사용자 로그인 후 content server가 authentication code 생성 후
// 사용자에게 보내면서 client (이 앱)에게 보내는 코드
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: 'auth/login' }),
    function (req, res) {
        res.redirect('/');
    });

module.exports = router;