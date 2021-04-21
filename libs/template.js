module.exports = {
    HTML: function (title, list, body, control, authStatusUI = '<a href="/auth/login">login</a> | <a href="/auth/register">Register</a>') {
        return `
        <!doctype html>
        <html>
        <head>
            ${authStatusUI}
            <title>${title}</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1><a href="/">WEB</a></h1>
            ${list}
            ${control}
            ${body}
        </body>
        </html>
        `;
    },
    list: function (topic, baseUrl) {
        let list = "<ul>";
        for (var i = 0; i < topic.length; i++) {
            list += `<li><a href="${baseUrl}/${topic[i].id}">${topic[i].title}</a></li>`;
        }
        list += "</ul>"
        return list;
    }
};