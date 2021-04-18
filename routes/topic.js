const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path'); // 사용자가 입력할 수 있는 path 세탁용
const sanitizeHtml = require('sanitize-html');
const template = require('../libs/template');


router.get('/create', (req, res, next) => {
    const title = "WEB - create";
    const list = template.list(req._list, req.baseUrl);
    const html = template.HTML(title, list, `
    <form action="${req.baseUrl}/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
    </form>
    `, `<a href="${req.baseUrl}/create">create</a>`);

    res.send(html);
});

router.post('/create_process', (req, res, next) => {
    const post = req.body;
    const title = path.parse(post.title).base;
    const description = post.description;

    fs.writeFile(`${req._dirPath}/${title}`, description, 'utf8', (err) => {
        if (err) {
            next(err);
        }
        else {
            // the default status for 'redirect(...)' is 302.
            res.redirect(302, `${req.baseUrl}/${title}`);
        }
    });
});

router.get('/update/:topicId', (req, res, next) => {
    const filteredID = path.parse(req.params.topicId).base;
    fs.readFile(`${req._dirPath}/${filteredID}`, 'utf8', (err, data) => {
        if (err) {
            next(err);
        }
        else {
            const title = filteredID;
            const list = template.list(req._list, req.baseUrl);
            const description = data;
            const html = template.HTML(title, list, `
            <form action="${req.baseUrl}/update_process" method="post">
                <input type="hidden" name="id" value=${title}>
                <p><input type="text" name="title" placeholder="title" value=${title}></p>
                <p><textarea name="description" placeholder="description">${description}</textarea></p>
                <p><input type="submit"></p>
            </form>
            `, `<a href="${req.baseUrl}/create">create</a>`);

            res.send(html);
        }
    });
});

router.post('/update_process', (req, res, next) => {
    var post = req.body;
    var id = path.parse(post.id).base;
    var title = path.parse(post.title).base;
    var description = post.description;

    fs.rename(`${req._dirPath}/${id}`, `${req._dirPath}/${title}`, (err) => {
        if (err) {
            next(err);
        }
        fs.writeFile(`${req._dirPath}/${title}`, description, 'utf8', (err) => {
            if (err) {
                next(err);
            }
            res.redirect(302, `${req.baseUrl}/${title}`);
        });
    });
});

router.post('/delete_process', (req, res, next) => {
    var post = req.body;
    var id = path.parse(post.id).base;

    fs.unlink(`${req._dirPath}/${id}`, (err) => {
        if (err) {
            next(err);
        }
        res.redirect(302, '/');
    });
});

// ?id=10 이렇게 query parameter로 보내기 보다 아래 같이 읽기 좋게 보내는게 트랜드~
router.get('/:topicId', (req, res, next) => {
    const filteredID = path.parse(req.params.topicId).base;
    fs.readFile(`${req._dirPath}/${filteredID}`, 'utf8', (err, data) => {
        if (err) {
            // error-handler middlewware에 보냄
            next(err);
        }
        else {
            const title = filteredID;
            const list = template.list(req._list, req.baseUrl);
            const description = data;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
                allowedTags: ['h1']
            });
            // Async 함수이기에 html을 함수 안에 넣어야함!
            const html = template.HTML(sanitizedTitle, list, `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`, `<a href="${req.baseUrl}/create">create</a> <a href="${req.baseUrl}/update/${sanitizedTitle}">update</a> 
            <form action="${req.baseUrl}/delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
            </form>`);

            res.send(html);
        }
    });
});

module.exports = router;