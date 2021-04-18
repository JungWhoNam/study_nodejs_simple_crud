const express = require('express')
const app = express()
const fs = require('fs');
const path = require('path'); // 사용자가 입력할 수 있는 path 세탁용
const sanitizeHtml = require('sanitize-html');
const compression = require('compression');
const template = require('./libs/template.js');

const port = 3000

app.use(express.urlencoded({ extended: false }));
app.use(compression());

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


app.get('/', (req, res, next) => {
    const title = "Welcome";
    const description = "Hello Node.js";
    const list = template.list(req._list);
    const html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a>`);

    res.send(html);
});

// ?id=10 이렇게 query parameter로 보내기 보다 아래 같이 읽기 좋게 보내는게 트랜드~
app.get('/page/:pageId', (req, res, next) => {
    const filteredID = path.parse(req.params.pageId).base;
    fs.readFile(`${req._dirPath}/${filteredID}`, 'utf8', (err, data) => {
        if (err) {
            // 밑에 있는 error-handler middlewware에 보냄
            next(err);
        }
        else {
            const title = filteredID;
            const list = template.list(req._list);
            const description = data;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
                allowedTags: ['h1']
            });
            // Async 함수이기에 html을 함수 안에 넣어야함!
            const html = template.HTML(sanitizedTitle, list, `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`, `<a href="/create">create</a> <a href="/update/${sanitizedTitle}">update</a> 
            <form action="/delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
            </form>`);

            res.send(html);
        }
    });
});

app.get('/create', (req, res, next) => {
    const title = "WEB - create";
    const list = template.list(req._list);
    const html = template.HTML(title, list, `
    <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
    </form>
    `, `<a href="/create">create</a>`);

    res.send(html);
});

app.post('/create_process', (req, res, next) => {
    const post = req.body;
    const title = path.parse(post.title).base;
    const description = post.description;

    fs.writeFile(`${req._dirPath}/${title}`, description, 'utf8', (err) => {
        if (err) {
            next(err);
        }
        else {
            // the default status for 'redirect(...)' is 302.
            res.redirect(302, `/page/${title}`);
        }
    });
});

app.get('/update/:pageId', (req, res, next) => {
    const filteredID = path.parse(req.params.pageId).base;
    fs.readFile(`${req._dirPath}/${filteredID}`, 'utf8', (err, data) => {
        if (err) {
            next(err);
        }
        else {
            const title = filteredID;
            const list = template.list(req._list);
            const description = data;
            const html = template.HTML(title, list, `
            <form action="/update_process" method="post">
                <input type="hidden" name="id" value=${title}>
                <p><input type="text" name="title" placeholder="title" value=${title}></p>
                <p><textarea name="description" placeholder="description">${description}</textarea></p>
                <p><input type="submit"></p>
            </form>
            `, `<a href="/create">create</a> <a href="/update?=${title}"></a>`);

            res.send(html);
        }
    });
});

app.post('/update_process', (req, res, next) => {
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
            res.redirect(302, `/page/${title}`);
        });
    });
});

app.post('/delete_process', (req, res, next) => {
    var post = req.body;
    var id = path.parse(post.id).base;

    fs.unlink(`${req._dirPath}/${id}`, (err) => {
        if (err) {
            next(err);
        }
        res.redirect(302, '/');
    });
});

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