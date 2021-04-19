const express = require('express');
const router = express.Router();
const template = require('../libs/template');

router.get('/login', (req, res, next) => {
    const title = "WEB - login";
    const list = template.list(req._list, '/topic');
    const html = template.HTML(title, list, `
    <form action="${req.baseUrl}/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p><input type="submit" value="login"></p>
    </form>
    `, ``);

    res.send(html);
});

router.get('/logout', (req, res, next) => {
    req.logout();

    // redirect하기 전에 session 파일에 업데이트 
    // 안그러면 redirect가 먼저 발생하여 logout 상태가 유지되지 않음
    req.session.destroy((err) => {
        res.redirect('/');
    });
    // req.session.save((err) => {
    //     res.redirect('/');
    // });
});

module.exports = router;