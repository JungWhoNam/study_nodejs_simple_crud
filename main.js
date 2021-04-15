const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const template = require('./libs/template.js');

// "requeset" client -> server
// "response" server -> client
var app = http.createServer(function (req, res) {
    // https://nodejs.org/api/http.html#http_message_url
    // https://nodejs.org/api/url.html#url_new_url_input_base
    // 첫번째 parameter가 relative 이면 base (두번째 parameter)가 필수
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/') {
        // https://nodejs.org/api/url.html#url_class_urlsearchparams
        if (url.searchParams.get('id') === null) {
            const dirPath = './data';
            fs.readdir(dirPath, (err, files) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Directory Not Found');
                }
                else {
                    const title = "Welcome";
                    const description = "Hello Node.js";
                    const list = template.list(files);
                    const html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a>`);

                    res.writeHead(200);
                    res.end(html);
                }
            });
        }
        else {
            const dirPath = './data';
            fs.readdir(dirPath, (err, files) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Directory Not Found');
                }
                else {
                    fs.readFile(`data/${url.searchParams.get('id')}`, 'utf8', (err, data) => {
                        if (err) {
                            res.writeHead(404);
                            res.end('File Not Found');
                        }
                        else {
                            const title = url.searchParams.get('id');
                            const list = template.list(files);
                            const description = data;
                            // Async 함수이기에 html을 함수 안에 넣어야함!
                            const html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a> <a href="/update?id=${title}">update</a> 
                            <form action="/delete_process" method="post">
                                <input type="hidden" name="id" value="${title}">
                                <input type="submit" value="delete">
                            </form>`);

                            res.writeHead(200);
                            res.end(html);
                        }
                    });
                }
            });
        }
    }
    else if (url.pathname === '/create') {
        const dirPath = './data';
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                res.writeHead(404);
                res.end('Directory Not Found');
            }
            else {
                const title = "WEB - create";
                const list = template.list(files);
                const html = template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p><textarea name="description" placeholder="description"></textarea></p>
                    <p><input type="submit"></p>
                </form>
                `, `<a href="/create">create</a>`);

                res.writeHead(200);
                res.end(html);
            }
        });
    }
    else if (url.pathname === '/create_process') {
        // when you output 'req', you will see '_events'
        // And under it you see 'on', 'end', 'pause', ...
        // so here we are telling it to deal with the events 'data' and 'end'.

        // asynchronously concat a chunk of data from a client
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        // after recieved the data from a client
        req.on('end', () => {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;

            fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                res.writeHead(302, { Location: `/?id=${title}` });
                res.end();
            });
        });
    }
    else if (url.pathname === '/update') {
        const dirPath = './data';
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                res.writeHead(404);
                res.end('Directory Not Found');
            }
            else {
                fs.readFile(`data/${url.searchParams.get('id')}`, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('File Not Found');
                    }
                    else {
                        const title = url.searchParams.get('id');
                        const list = template.list(files);
                        const description = data;
                        const html = template.HTML(title, list, `
                        <form action="/update_process" method="post">
                            <input type="hidden" name="id" value=${title}>
                            <p><input type="text" name="title" placeholder="title" value=${title}></p>
                            <p><textarea name="description" placeholder="description">${description}</textarea></p>
                            <p><input type="submit"></p>
                        </form>
                        `, `<a href="/create">create</a> <a href="/update?=${title}"></a>`);

                        res.writeHead(200);
                        res.end(html);
                    }
                });
            }
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
            var id = post.id;
            var title = post.title;
            var description = post.description;

            fs.rename(`data/${id}`, `data/${title}`, (err) => {
                fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                    res.writeHead(302, { Location: `/?id=${title}` });
                    res.end();
                });
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
            var id = post.id;

            fs.unlink(`data/${id}`, (err) => {
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