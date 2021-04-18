module.exports = {
    HTML: function (title, list, body, control, authStatusUI = '<a href="/auth/login">login</a>') {
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
    list: function (files, baseUrl) {
        let list = "<ul>";
        for (var i = 0; i < files.length; i++) {
            list += `<li><a href="${baseUrl}/${files[i]}">${files[i]}</a></li>`;
        }
        list += "</ul>"
        return list;
    }
};