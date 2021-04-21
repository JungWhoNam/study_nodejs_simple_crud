const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const template = require('../libs/template');
const auth = require('../libs/auth');
const db = require('../libs/db');
const shortid = require('shortid');

router.get('/create', (req, res, next) => {
    if (!auth.authIsOwner(req, res)) {
        req.flash('error', `Please login.`);
        return res.redirect('/');
    }

    const title = "WEB - create";
    const list = template.list(req._list, req.baseUrl);
    const html = template.HTML(title, list, `
    <form action="${req.baseUrl}/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
    </form>
    `, `<a href="${req.baseUrl}/create">create</a>`,
        auth.authStatusUI(req, res));

    res.send(html);
});

router.post('/create_process', (req, res, next) => {
    if (!auth.authIsOwner(req, res)) {
        req.flash('error', `Please login.`);
        res.redirect('/');
        return false;
    }

    const post = req.body;
    const title = post.title;
    const description = post.description;

    const id = shortid.generate();
    db.get('topics').push({
        id: id,
        title: title,
        description: description,
        user_id: req.user.id
    }).write();

    res.redirect(302, `${req.baseUrl}/${id}`);
});

router.get('/update/:topicId', (req, res, next) => {
    if (!auth.authIsOwner(req, res)) {
        req.flash('error', `Please login.`);
        res.redirect('/');
        return false;
    }

    const topic = db.get('topics').find({
        id: req.params.topicId
    }).value();
    if (!topic) {
        req.flash('error', `Topic ${id} does not exist.`);
        return res.redirect('/');
    }

    const title = topic.title;
    const list = template.list(req._list, req.baseUrl);
    const description = topic.description;
    const html = template.HTML(title, list, `
    <form action="${req.baseUrl}/update_process" method="post">
        <input type="hidden" name="id" value=${topic.id}>
        <p><input type="text" name="title" placeholder="title" value=${title}></p>
        <p><textarea name="description" placeholder="description">${description}</textarea></p>
        <p><input type="submit"></p>
    </form>
    `, `<a href="${req.baseUrl}/create">create</a>`,
        auth.authStatusUI(req, res));

    res.send(html);
});

router.post('/update_process', (req, res, next) => {
    if (!auth.authIsOwner(req, res)) {
        req.flash('error', `Please login.`);
        res.redirect('/');
        return false;
    }

    var post = req.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;

    var topic = db.get('topics').find({ id: id }).value();
    if (!topic) {
        req.flash('error', `Topic ${id} does not exist.`);
        return res.redirect('/');
    }

    if (topic.user_id !== req.user.id) {
        req.flash('error', `Topic ${id} is not yours.`);
        return res.redirect('/');
    }
    else {
        db.get('topics').find({
            id: id
        }).assign({
            title: title,
            description: description
        }).write();

        req.flash('success', `Successfully updated the topic: ${id}`);
        return res.redirect(302, `${req.baseUrl}/${id}`);
    }
});

router.post('/delete_process', (req, res, next) => {
    if (!auth.authIsOwner(req, res)) {
        req.flash('error', `Please login.`);
        res.redirect('/');
        return false;
    }

    var post = req.body;
    var id = post.id;

    var topic = db.get('topics').find({ id: id }).value();
    if (!topic) {
        req.flash('error', `Topic ${id} does not exist.`);
        return res.redirect('/');
    }

    if (topic.user_id !== req.user.id) {
        req.flash('error', `Topic ${id} is not yours.`);
        return res.redirect('/');
    }
    else {
        db.get('topics').remove({ id: id }).write();
        req.flash('success', `Successfully removed the topic: ${id}`);
        return res.redirect(302, '/');
    }
});

// ?id=10 이렇게 query parameter로 보내기 보다 아래 같이 읽기 좋게 보내는게 트랜드~
router.get('/:topicId', (req, res, next) => {
    const topic = db.get('topics').find({
        id: req.params.topicId
    }).value();
    if (!topic) {
        req.flash('error', `Topic ${topic.id} does not exist.`);
        return res.redirect('/');
    }

    const user = db.get('users').find({
        id: topic.user_id
    }).value();
    if (!user) {
        req.flash('error', `User ${topic.user_id} does not exist.`);
        return res.redirect('/');
    }

    const list = template.list(req._list, req.baseUrl);
    var sanitizedTitle = sanitizeHtml(topic.title);
    var sanitizedDescription = sanitizeHtml(topic.description, {
        allowedTags: ['h1']
    });
    // Async 함수이기에 html을 함수 안에 넣어야함!
    const html = template.HTML(sanitizedTitle, list, `
    <h2>${sanitizedTitle}</h2>
    <p>${sanitizedDescription}</p>
    <p style="font-style: italic;">written by ${user.email}</p>`,
        `<a href="${req.baseUrl}/create">create</a> <a href="${req.baseUrl}/update/${topic.id}">update</a> 
    <form action="${req.baseUrl}/delete_process" method="post">
        <input type="hidden" name="id" value="${topic.id}">
        <input type="submit" value="delete">
    </form>`,
        auth.authStatusUI(req, res));

    res.send(html);
});

module.exports = router;