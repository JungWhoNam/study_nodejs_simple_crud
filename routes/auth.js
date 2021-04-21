const express = require('express');
const router = express.Router();
const passport = require('passport');
const template = require('../libs/template');

module.exports = function () {
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

    router.get('/logout', (req, res, next) => {
        // terminate a login session
        req.logout();
        // go back to home
        res.redirect('/');
    });

    return router;
}