var http = require('http');
var fs = require('fs');
var qs = require('querystring');

function templateHTML(title, list, body) {
    return `
    <!doctype html>
    <html>
    <head>
        <title>${title}</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        <a href="/create">create</a>
        ${body}
    </body>
    </html>
    `;
}

function templateList(files) {
    let list = "<ul>";
    for (var i = 0; i < files.length; i++) {
        list += `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`;
    }
    list += "</ul>"
    return list;
}

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
                    const list = templateList(files);

                    const template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);

                    res.writeHead(200);
                    res.end(template);
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
                    const list = templateList(files);

                    fs.readFile(`data/${url.searchParams.get('id')}`, 'utf8', (err, data) => {
                        if (err) {
                            res.writeHead(404);
                            res.end('File Not Found');
                        }
                        else {
                            const title = url.searchParams.get('id');
                            const description = data;

                            // Async 함수이기에 template 을 함수 안에 넣어야함!
                            const template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);

                            res.writeHead(200);
                            res.end(template);
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
                const list = templateList(files);

                const template = templateHTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title"></p>
                    <p><textarea name="description"></textarea></p>
                    <p><input type="submit"></p>
                </form>
                `);

                res.writeHead(200);
                res.end(template);
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
    else {
        res.writeHead(404);
        res.end('Not Found');
    }

});
app.listen(3000);