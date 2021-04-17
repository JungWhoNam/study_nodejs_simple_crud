const db = require('./db');
const template = require('./template');
const qs = require('querystring');

exports.home = function (req, res) {
    db.query(`SELECT * FROM topic`, (errSelectTopic, topics) => {
        if (errSelectTopic) {
            throw errSelectTopic;
        }

        const title = "Welcome";
        const description = "Hello Node.js";
        const list = template.list(topics);
        const html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a>`);

        res.writeHead(200);
        res.end(html);
    });
}

exports.page = function (req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);

    db.query(`SELECT * FROM topic`, (errSelectTopic, topics) => {
        if (errSelectTopic) {
            throw errSelectTopic;
        }

        //`SELECT * FROM topic WHERE id=${filteredID}` 대신 밑에 있는 방식을 쓰는 이유
        // [filteredID] 값이 세탁 되어서 ? 값에 들어감
        // topic.id AS id 를 사용하지 않으면 result[0].id의 값이 author.id로 나옴.
        db.query(`SELECT *, topic.id AS id FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [url.searchParams.get('id')], (errJoin, result) => {
            if (errJoin) {
                throw errJoin;
            }

            const title = result[0].title;
            const list = template.list(topics);
            const description = result[0].description;
            const html = template.HTML(title, list,
                `<h2>${title}</h2><p>${description}</p><p>by ${result[0].name}</p>`,
                `<a href="/create">create</a> 
            <a href="/update?id=${result[0].id}">update</a> 
            <form action="/delete_process" method="post">
                <input type="hidden" name="id" value="${result[0].id}">
                <input type="submit" value="delete">
            </form>`);

            res.writeHead(200);
            res.end(html);
        });
    });
}

exports.create = function (req, res) {
    db.query(`SELECT * FROM topic`, (errSelectTopic, topics) => {
        if (errSelectTopic) {
            throw errSelectTopic;
        }

        db.query(`SELECT * FROM author`, (errSelectAuthor, authors) => {
            if (errSelectAuthor) {
                throw errSelectAuthor;
            }

            const title = "Web - create";
            const list = template.list(topics);
            const html = template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p><textarea name="description" placeholder="description"></textarea></p>
                    <p>
                        ${template.authorSelect(authors)}
                    </p>
                    <p><input type="submit"></p>
                </form>
                `, `<b>Create...</b>`);

            res.writeHead(200);
            res.end(html);
        });
    });
}

exports.create_process = function (req, res) {
    // asynchronously concat a chunk of data from a client
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    // after done recieving the data from a client
    req.on('end', () => {
        const post = qs.parse(body);

        db.query(`INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`, [post.title, post.description, post.author], (err, result) => {
            if (err) {
                throw err;
            }
            // redirect using the id of the inserted row
            res.writeHead(302, { Location: `/?id=${result.insertId}` });
            res.end();
        });
    });
}

exports.update = function (req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);

    db.query(`SELECT * FROM topic`, (errSelectTopic, topics) => {
        if (errSelectTopic) {
            throw errSelectTopic;
        }

        db.query(`SELECT * FROM topic WHERE id=?`, [url.searchParams.get('id')], (errSelectTopicId, result) => {
            if (errSelectTopicId) {
                throw errSelectTopicId;
            }

            db.query(`SELECT * FROM author`, (errSelectAuthor, authors) => {
                if (errSelectAuthor) {
                    throw errSelectAuthor;
                }

                const title = result[0].title;
                const list = template.list(topics);
                const description = result[0].description;
                const html = template.HTML(title, list, `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value=${result[0].id}>
                    <p><input type="text" name="title" placeholder="title" value=${title}></p>
                    <p><textarea name="description" placeholder="description">${description}</textarea></p>
                    <p>${template.authorSelect(authors, result[0].author_id)}</p>
                    <p><input type="submit"></p>
                </form>
                `, `<b>Update... ${title}</b>`);

                res.writeHead(200);
                res.end(html);
            });
        });
    });
}

exports.update_process = function (req, res) {
    // asynchronously concat a chunk of data from a client
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });
    // after recieved the data from a client
    req.on('end', () => {
        const post = qs.parse(body);

        db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`, [post.title, post.description, post.author, post.id], (err) => {
            if (err) {
                throw err;
            }

            res.writeHead(302, { Location: `/?id=${post.id}` });
            res.end();
        });
    });
}

exports.delete_process = function (req, res) {
    // asynchronously concat a chunk of data from a client
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });
    // after recieved the data from a client
    req.on('end', () => {
        var post = qs.parse(body);
        db.query(`DELETE FROM topic WHERE id=?`, [post.id], (err) => {
            if (err) {
                throw err;
            }

            res.writeHead(302, { Location: `/` });
            res.end();
        });
    });
}