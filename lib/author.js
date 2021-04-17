const db = require('./db');
const template = require('./template');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');

exports.home = function (req, res) {
    db.query(`SELECT * FROM topic`, (errSelectTopic, topics) => {
        if (errSelectTopic) {
            throw errSelectTopic;
        }

        db.query(`SELECT * FROM author`, (errSelectAuthor, authors) => {
            if (errSelectAuthor) {
                throw errSelectAuthor;
            }

            const title = "Author";
            const list = template.list(topics);
            const html = template.HTML(title, list,
                `
            ${template.authorTable(authors)}
            <style>
                table{
                    border-collapse:collapse;
                }
                td{
                    border:1px solid black;
                }
            </style>
            <form action="/author/create_process" method="post">
                <p>
                    <input type="text" name="name" placeholder="author name">
                </p>
                <p>
                    <textarea name="profile" placeholder="author profile"></textarea>
                </p>
                <p>
                    <input type="submit" value="create">
                </p>
            </form>
            `, ``);

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

        db.query(`INSERT INTO author (name, profile) VALUES(?, ?)`, [post.name, post.profile], (err, result) => {
            if (err) {
                throw err;
            }
            // redirect using the id of the inserted row
            res.writeHead(302, { Location: `/author` });
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

        db.query(`SELECT * FROM author`, (errSelectAuthor, authors) => {
            if (errSelectAuthor) {
                throw errSelectAuthor;
            }

            db.query(`SELECT * FROM author WHERE id=?`, [url.searchParams.get('id')], (errSelectAuthorById, result) => {
                if (errSelectAuthorById) {
                    throw errSelectAuthorById;
                }

                const title = `Update... ${result[0].name}`;
                const list = template.list(topics);
                const html = template.HTML(title, list,
                    `
                    ${template.authorTable(authors)}
                    <style>
                        table{
                            border-collapse:collapse;
                        }
                        td{
                            border:1px solid black;
                        }
                    </style>
                    <form action="/author/update_process" method="post">
                        <p>
                            <input type="hidden" name="id" value="${result[0].id}">
                        </p>
                        <p>
                            <input type="text" name="name" placeholder="author name" value="${sanitizeHtml(result[0].name)}">
                        </p>
                        <p>
                            <textarea name="profile" placeholder="author profile">${sanitizeHtml(result[0].profile)}</textarea>
                        </p>
                        <p>
                            <input type="submit" value="update">
                        </p>
                    </form>
                    `, ``);

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

        db.query(`UPDATE author SET name=?, profile=? WHERE id=?`, [post.name, post.profile, post.id], (err) => {
            if (err) {
                throw err;
            }
            res.writeHead(302, { Location: `/author` });
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

        db.query(`DELETE FROM topic WHERE author_id=?`, [post.id], (errDeleteTopic) => {
            if (errDeleteTopic) {
                throw errDeleteTopic;
            }

            db.query(`DELETE FROM author WHERE id=?`, [post.id], (errDeleteAuthor) => {
                if (errDeleteAuthor) {
                    throw errDeleteAuthor;
                }

                res.writeHead(302, { Location: `/author` });
                res.end();
            });
        });
    });
}