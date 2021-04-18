const express = require('express');
const router = express.Router();
const template = require('../libs/template');
const auth = require('../libs/auth');

router.get('/', (req, res, next) => {
    const title = "Welcome";
    const description = "Hello Node.js and Express";
    const list = template.list(req._list, '/topic');
    const html = template.HTML(title, list,
        `
        <h2>${title}</h2>
        <p>${description}</p>
        <img src="/images/lina-verovaya-EN43Neaqpz4-unsplash.jpg" style="width:300px; margin-top:10px">
        `, `<a href="/topic/create">create</a>`, auth.authStatusUI(req, res));

    res.send(html);
});

module.exports = router;