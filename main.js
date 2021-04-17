const express = require('express')
const app = express()
const fs = require('fs');
const path = require('path'); // 사용자가 입력할 수 있는 path 세탁용
const sanitizeHtml = require('sanitize-html');
const compression = require('compression');
const template = require('./libs/template.js');

const port = 3000
const dirPath = './data';

app.use(express.urlencoded({ extended: false }));
app.use(compression());

app.get('/', (req, res) => {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            res.status(404).send('Directory Not Found');
        }
        else {
            const title = "Welcome";
            const description = "Hello Node.js";
            const list = template.list(files);
            const html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a>`);

            res.send(html);
        }
    });
})

// ?id=10 이렇게 query parameter로 보내기 보다 아래 같이 보내는게 트랜드~
app.get('/page/:pageId', (req, res) => {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            res.status(404).send('Directory Not Found');
        }
        else {
            const filteredID = path.parse(req.params.pageId).base;
            fs.readFile(`${dirPath}/${filteredID}`, 'utf8', (errFile, data) => {
                if (errFile) {
                    res.status(404).send('File Not Found');
                }
                else {
                    const title = filteredID;
                    const list = template.list(files);
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
        }
    });
});

app.get('/create', (req, res) => {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            res.status(404).send('Directory Not Found');
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

            res.send(html);
        }
    });
});

app.post('/create_process', (req, res) => {
    const post = req.body;
    const title = path.parse(post.title).base;
    const description = post.description;

    fs.writeFile(`${dirPath}/${title}`, description, 'utf8', (err) => {
        if (err) {
            res.status(404).send("Failed to save the data");
        }
        else {
            // the default status for 'redirect(...)' is 302.
            res.redirect(302, `/page/${title}`);
        }
    });
});

app.get('/update/:pageId', (req, res) => {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            res.status(404).send('Directory Not Found');
        }
        else {
            const filteredID = path.parse(req.params.pageId).base;
            fs.readFile(`${dirPath}/${filteredID}`, 'utf8', (errFile, data) => {
                if (errFile) {
                    res.status(404).send('File Not Found');
                }
                else {
                    const title = filteredID;
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

                    res.send(html);
                }
            });
        }
    });
});

app.post('/update_process', (req, res) => {
    var post = req.body;
    var id = path.parse(post.id).base;
    var title = path.parse(post.title).base;
    var description = post.description;

    fs.rename(`${dirPath}/${id}`, `${dirPath}/${title}`, (err) => {
        fs.writeFile(`${dirPath}/${title}`, description, 'utf8', (err) => {
            res.redirect(302, `/page/${title}`);
        });
    });
});

app.post('/delete_process', (req, res) => {
    var post = req.body;
    var id = path.parse(post.id).base;

    fs.unlink(`${dirPath}/${id}`, (err) => {
        res.redirect(302, '/');
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})



// const dirPath = './data';

// // "requeset" client -> server
// // "response" server -> client
// var app = http.createServer(function (req, res) {
//     // https://nodejs.org/api/http.html#http_message_url
//     // https://nodejs.org/api/url.html#url_new_url_input_base
//     // 첫번째 parameter가 relative 이면 base (두번째 parameter)가 필수
//     const url = new URL(req.url, `http://${req.headers.host}`);

//     if (url.pathname === '/') {
//         // https://nodejs.org/api/url.html#url_class_urlsearchparams
//         if (url.searchParams.get('id') === null) {
//             fs.readdir(dirPath, (err, files) => {
//                 if (err) {
//                     res.writeHead(404);
//                     res.end('Directory Not Found');
//                 }
//                 else {
//                     const title = "Welcome";
//                     const description = "Hello Node.js";
//                     const list = template.list(files);
//                     const html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a>`);

//                     res.writeHead(200);
//                     res.end(html);
//                 }
//             });
//         }
//         else {
//             fs.readdir(dirPath, (err, files) => {
//                 if (err) {
//                     res.writeHead(404);
//                     res.end('Directory Not Found');
//                 }
//                 else {
//                     const filteredID = path.parse(url.searchParams.get('id')).base;
//                     fs.readFile(`${dirPath}/${filteredID}`, 'utf8', (err, data) => {
//                         if (err) {
//                             res.writeHead(404);
//                             res.end('File Not Found');
//                         }
//                         else {
//                             const title = filteredID;
//                             const list = template.list(files);
//                             const description = data;
//                             var sanitizedTitle = sanitizeHtml(title);
//                             var sanitizedDescription = sanitizeHtml(description, {
//                               allowedTags:['h1']
//                             });
//                             // Async 함수이기에 html을 함수 안에 넣어야함!
//                             const html = template.HTML(sanitizedTitle, list, `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`, `<a href="/create">create</a> <a href="/update?id=${sanitizedTitle}">update</a> 
//                             <form action="/delete_process" method="post">
//                                 <input type="hidden" name="id" value="${sanitizedTitle}">
//                                 <input type="submit" value="delete">
//                             </form>`);

//                             res.writeHead(200);
//                             res.end(html);
//                         }
//                     });
//                 }
//             });
//         }
//     }
//     else if (url.pathname === '/create') {
//         fs.readdir(dirPath, (err, files) => {
//             if (err) {
//                 res.writeHead(404);
//                 res.end('Directory Not Found');
//             }
//             else {
//                 const title = "WEB - create";
//                 const list = template.list(files);
//                 const html = template.HTML(title, list, `
//                 <form action="/create_process" method="post">
//                     <p><input type="text" name="title" placeholder="title"></p>
//                     <p><textarea name="description" placeholder="description"></textarea></p>
//                     <p><input type="submit"></p>
//                 </form>
//                 `, `<a href="/create">create</a>`);

//                 res.writeHead(200);
//                 res.end(html);
//             }
//         });
//     }
//     else if (url.pathname === '/create_process') {
//         // when you output 'req', you will see '_events'
//         // And under it you see 'on', 'end', 'pause', ...
//         // so here we are telling it to deal with the events 'data' and 'end'.

//         // asynchronously concat a chunk of data from a client
//         let body = '';
//         req.on('data', chunk => {
//             body += chunk;
//         });
//         // after recieved the data from a client
//         req.on('end', () => {
//             const post = qs.parse(body);
//             const title = path.parse(post.title).base;
//             const description = post.description;

//             fs.writeFile(`${dirPath}/${title}`, description, 'utf8', (err) => {
//                 if (err) {
//                     res.writeHead(404);
//                     res.end("Failed to save the data");
//                 }
//                 else {
//                     res.writeHead(302, { Location: `/?id=${title}` });
//                     res.end();
//                 }
//             });
//         });
//     }
//     else if (url.pathname === '/update') {
//         fs.readdir(dirPath, (err, files) => {
//             if (err) {
//                 res.writeHead(404);
//                 res.end('Directory Not Found');
//             }
//             else {
//                 const filteredID = path.parse(url.searchParams.get('id')).base;
//                 fs.readFile(`${dirPath}/${filteredID}`, 'utf8', (err, data) => {
//                     if (err) {
//                         res.writeHead(404);
//                         res.end('File Not Found');
//                     }
//                     else {
//                         const title = filteredID;
//                         const list = template.list(files);
//                         const description = data;
//                         const html = template.HTML(title, list, `
//                         <form action="/update_process" method="post">
//                             <input type="hidden" name="id" value=${title}>
//                             <p><input type="text" name="title" placeholder="title" value=${title}></p>
//                             <p><textarea name="description" placeholder="description">${description}</textarea></p>
//                             <p><input type="submit"></p>
//                         </form>
//                         `, `<a href="/create">create</a> <a href="/update?=${title}"></a>`);

//                         res.writeHead(200);
//                         res.end(html);
//                     }
//                 });
//             }
//         });
//     }
//     else if (url.pathname === '/update_process') {
//         // asynchronously concat a chunk of data from a client
//         let body = '';
//         req.on('data', chunk => {
//             body += chunk;
//         });
//         // after recieved the data from a client
//         req.on('end', () => {
//             var post = qs.parse(body);
//             var id = path.parse(post.id).base;
//             var title = path.parse(post.title).base;
//             var description = post.description;

//             fs.rename(`${dirPath}/${id}`, `${dirPath}/${title}`, (err) => {
//                 fs.writeFile(`${dirPath}/${title}`, description, 'utf8', (err) => {
//                     res.writeHead(302, { Location: `/?id=${title}` });
//                     res.end();
//                 });
//             });
//         });
//     }
//     else if (url.pathname === '/delete_process') {
//         // asynchronously concat a chunk of data from a client
//         let body = '';
//         req.on('data', chunk => {
//             body += chunk;
//         });
//         // after recieved the data from a client
//         req.on('end', () => {
//             var post = qs.parse(body);
//             var id = path.parse(post.id).base;

//             fs.unlink(`${dirPath}/${id}`, (err) => {
//                 res.writeHead(302, { Location: "/" });
//                 res.end();
//             });
//         });
//     }
//     else {
//         res.writeHead(404);
//         res.end('Not Found');
//     }
// });
// app.listen(3000);