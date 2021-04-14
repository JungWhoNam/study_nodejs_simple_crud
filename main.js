var http = require('http');
var fs = require('fs');

// "requeset" client -> server
// "response" server -> client
var app = http.createServer(function (req, res) {
    // https://nodejs.org/api/http.html#http_message_url
    // https://nodejs.org/api/url.html#url_new_url_input_base
    // 첫번째 parameter가 relative 이면 base (두번째 parameter)가 필수
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname == '/') {
        console.log(url.searchParams.get('id'));
        // https://nodejs.org/api/url.html#url_class_urlsearchparams
        if (url.searchParams.get('id') === null) {
            let title = "Welcome";
            let description = "Hello Node.js";

            var template = `
            <!doctype html>
            <html>
            <head>
                <title>${title}</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1><a href="/">WEB</a></h1>
                <ol>
                    <li><a href="?id=HTML">HTML</a></li>
                    <li><a href="?id=CSS"">CSS</a></li>
                    <li><a href="?id=JavaScript">JavaScript</a></li>
                </ol>
                <h2>${title}</h2>
                <p>
                    ${description}
                </p>
            </body>
            </html>
            `;

            res.writeHead(200);
            res.end(template);
        }
        else {
            fs.readFile(`data/${url.searchParams.get('id')}`, 'utf8', (err, data) => {
                if (err) {
                    return res.writeHead(404);
                }
                else {
                    let title = url.searchParams.get('id');
                    // Async 함수이기에 template 을 함수 안에 넣어야함!
                    var template = `
                    <!doctype html>
                    <html>
                    <head>
                        <title>${title}</title>
                        <meta charset="utf-8">
                    </head>
                    <body>
                        <h1><a href="/">WEB</a></h1>
                        <ol>
                            <li><a href="?id=HTML">HTML</a></li>
                            <li><a href="?id=CSS"">CSS</a></li>
                            <li><a href="?id=JavaScript">JavaScript</a></li>
                        </ol>
                        <h2>${title}</h2>
                        <p>
                            ${data}
                        </p>
                    </body>
                    </html>
                    `;

                    res.writeHead(200);
                    res.end(template);
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