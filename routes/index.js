const express = require('express');
const router = express.Router();
const template = require('../libs/template');
const auth = require('../libs/auth');

router.get('/', (req, res, next) => {
    // console.log(req.user); // deserializeUser의 done의 두번째 인자 값
    // console.log(req.session); // 로그인 성공시 serializeUser의 done의 두번째 인자 값이 passport: {...}에 추가됨
    let feedback = req.flash('success');

    const title = "Welcome";
    const description = "Hello Node.js and Express";
    const list = template.list(req._list, '/topic');
    const html = template.HTML(title, list,
        `
        <div style="color:blue;">${feedback}</div>
        <h2>${title}</h2>
        <p>${description}</p>
        <img src="/images/lina-verovaya-EN43Neaqpz4-unsplash.jpg" style="width:300px; margin-top:10px">
        `, `<a href="/topic/create">create</a>`, auth.authStatusUI(req, res));

    res.send(html);
});

module.exports = router;