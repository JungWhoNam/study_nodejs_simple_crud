module.exports = {
    HTML: function templateHTML(title, list, body, control) {
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
            ${control}
            ${body}
        </body>
        </html>
        `;
    },
    list: function templateList(files) {
        let list = "<ul>";
        for (var i = 0; i < files.length; i++) {
            list += `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`;
        }
        list += "</ul>"
        return list;
    }
};