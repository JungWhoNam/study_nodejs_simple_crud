const express = require('express');
const router = express.Router();
const template = require('../libs/template');

const authData = {
    // version system에 올릴때 password 값을 올리지 말기!!!
    // 또한 값을 암호화해서 개발자도 모르게 해야함
    email: '',
    password: '',
    nickname: ''
}

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

// router.post('/login_process', (req, res, next) => {
//     const post = req.body;
//     const email = post.email;
//     const pwd = post.pwd;

//     if (email === authData.email && pwd === authData.password) {
//         req.session.is_logined = true;
//         req.session.nickname = authData.nickname;
//         // 추가된 정보가 있는 session을 저장 (redirect하기 전에)
//         // 안그러면 session이 파일에 저장되기 전에 redirect가 발생하여 login 상태가 유지되지 않음
//         req.session.save((err) => {
//             res.redirect(`/`);
//         });
//     }
//     else {
//         next('who???');
//     }
// });

router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/');
    });
});

module.exports = router;