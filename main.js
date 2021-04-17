const http = require('http');
const topic = require('./lib/topic');
const author = require('./lib/author');


// "requeset" client -> server
// "response" server -> client
var app = http.createServer(function (req, res) {
    // https://nodejs.org/api/http.html#http_message_url
    // https://nodejs.org/api/url.html#url_new_url_input_base
    // 첫번째 parameter가 relative 이면 base (두번째 parameter)가 필수
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/') {
        if (url.searchParams.get('id') === null) {
            topic.home(req, res);
        }
        else {
            topic.page(req, res);
        }
    }
    else if (url.pathname === '/create') {
        topic.create(req, res);
    }
    else if (url.pathname === '/create_process') {
        topic.create_process(req, res);
    }
    else if (url.pathname === '/update') {
        topic.update(req, res);
    }
    else if (url.pathname === '/update_process') {
        topic.update_process(req, res);
    }
    else if (url.pathname === '/delete_process') {
        topic.delete_process(req, res);
    }
    else if (url.pathname === '/author') {
        author.home(req, res);
    }
    else if (url.pathname === '/author/create_process') {
        author.create_process(req, res);
    }
    else if (url.pathname === '/author/update') {
        author.update(req, res);
    }
    else if (url.pathname === '/author/update_process') {
        author.update_process(req, res);
    }
    else if (url.pathname === '/author/delete_process') {
        author.delete_process(req, res);
    }
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
});
app.listen(3000);