const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const path = require('path'); // 사용자가 입력할 수 있는 path 세탁용
const sanitizeHtml = require('sanitize-html');
const mysql = require('mysql');
const template = require('./libs/template.js');


const dirPath = './data';
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: 'Jung1234',
    database: 'tutorials'
});
db.connect();


// "requeset" client -> server
// "response" server -> client
var app = http.createServer(function (req, res) {
    // https://nodejs.org/api/http.html#http_message_url
    // https://nodejs.org/api/url.html#url_new_url_input_base
    // 첫번째 parameter가 relative 이면 base (두번째 parameter)가 필수
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/') {
        if (url.searchParams.get('id') === null) {
            db.query(`SELECT * FROM topic`, (err, results) => {
                if (err) {
                    throw err;
                }

                const title = "Welcome";
                const description = "Hello Node.js";
                const list = template.list(results);
                const html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a>`);

                res.writeHead(200);
                res.end(html);
            });
        }
        else {
            db.query(`SELECT * FROM topic`, (err, results) => {
                if (err) {
                    throw err;
                }

                //`SELECT * FROM topic WHERE id=${filteredID}` 대신 밑에 있는 방식을 쓰는 이유
                // [filteredID] 값이 세탁 되어서 ? 값에 들어감
                db.query(`SELECT * FROM topic WHERE id=?`, [url.searchParams.get('id')], (err2, result) => {
                    if (err2) {
                        throw err2;
                    }

                    const title = result[0].title;
                    const list = template.list(results);
                    const description = result[0].description;
                    const html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a> <a href="/update?id=${url.searchParams.get('id')}">update</a> 
                    <form action="/delete_process" method="post">
                        <input type="hidden" name="id" value="${url.searchParams.get('id')}">
                        <input type="submit" value="delete">
                    </form>`);

                    res.writeHead(200);
                    res.end(html);
                });
            });
        }
    }
    else if (url.pathname === '/create') {
        db.query(`SELECT * FROM topic`, (err, results) => {
            if (err) {
                throw err;
            }

            const title = "Web - create";
            const list = template.list(results);
            const html = template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p><textarea name="description" placeholder="description"></textarea></p>
                    <p><input type="submit"></p>
                </form>
                `, `<a href="/create">create</a>`);

            res.writeHead(200);
            res.end(html);
        });
    }
    else if (url.pathname === '/create_process') {
        // asynchronously concat a chunk of data from a client
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        // after done recieving the data from a client
        req.on('end', () => {
            const post = qs.parse(body);

            db.query(`INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`, [post.title, post.description, 1], (err, result) => {
                if (err) {
                    throw err;
                }
                // redirect using the id of the inserted row
                res.writeHead(302, { Location: `/?id=${result.insertId}` });
                res.end();
            });
        });
    }
    else if (url.pathname === '/update') {
        db.query(`SELECT * FROM topic`, (err, results) => {
            if (err) {
                throw err;
            }

            db.query(`SELECT * FROM topic WHERE id=?`, [url.searchParams.get('id')], (err2, result) => {
                if (err2) {
                    throw err2;
                }

                const title = result[0].title;
                const list = template.list(results);
                const description = result[0].description;
                const html = template.HTML(title, list, `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value=${result[0].id}>
                    <p><input type="text" name="title" placeholder="title" value=${title}></p>
                    <p><textarea name="description" placeholder="description">${description}</textarea></p>
                    <p><input type="submit"></p>
                </form>
                `, `<a href="/create">create</a>`);

                res.writeHead(200);
                res.end(html);
            });
        });
    }
    else if (url.pathname === '/update_process') {
        // asynchronously concat a chunk of data from a client
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        // after recieved the data from a client
        req.on('end', () => {
            var post = qs.parse(body);

            db.query(`UPDATE topic SET title=?, description=? WHERE id=?`, [post.title, post.description, post.id], (err, result) => {
                if (err) {
                    throw err;
                }

                res.writeHead(302, { Location: `/?id=${post.id}` });
                res.end();
            });
        });
    }
    else if (url.pathname === '/delete_process') {
        // asynchronously concat a chunk of data from a client
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        // after recieved the data from a client
        req.on('end', () => {
            var post = qs.parse(body);
            var id = path.parse(post.id).base;

            fs.unlink(`${dirPath}/${id}`, (err) => {
                res.writeHead(302, { Location: "/" });
                res.end();
            });
        });
    }
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
});
app.listen(3000);