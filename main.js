var http = require('http');
var fs = require('fs');

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
        ${body}
    </body>
    </html>
    `;
}

function templateList(files) {
    let list = "<ul>";
    for (var i = 0; i < files.length; i++) {
        list += `<li><a href="?id=${files[i]}">${files[i]}</a></li>`;
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

    if (url.pathname == '/') {
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
    else {
        res.writeHead(404);
        res.end('Not Found');
    }

});
app.listen(3000);