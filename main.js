var http = require('http');
var fs = require('fs');

// "requeset" client -> server
// "response" server -> client
var app = http.createServer(function (req, res) {
    // https://nodejs.org/api/http.html#http_message_url
    // https://nodejs.org/api/url.html#url_new_url_input_base
    // 첫번째 parameter가 relative 이면 base (두번째 parameter)가 필수
    const url = new URL(req.url, `http://${req.headers.host}`);

    // https://nodejs.org/api/url.html#url_class_urlsearchparams
    let title = url.searchParams.get('id');
    if (req.url == '/') {
        title = 'Welcome';
    }
    if (req.url == '/favicon.ico') {
        return res.writeHead(404);
    }

    res.writeHead(200);
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
        <p><a href="https://www.w3.org/TR/html5/" target="_blank" title="html5 speicification">Hypertext Markup Language (HTML)</a> is the standard markup language for <strong>creating <u>web</u> pages</strong> and web applications.Web browsers receive HTML documents from a web server or from local storage and render them into multimedia web pages. HTML describes the structure of a web page semantically and originally included cues for the appearance of the document.
        <img src="coding.jpg" width="100%">
        </p><p style="margin-top:45px;">HTML elements are the building blocks of HTML pages. With HTML constructs, images and other objects, such as interactive forms, may be embedded into the rendered page. It provides a means to create structured documents by denoting structural semantics for text such as headings, paragraphs, lists, links, quotes and other items. HTML elements are delineated by tags, written using angle brackets.
        </p>
    </body>
    </html>
    `;
    res.end(template);
});
app.listen(3000);