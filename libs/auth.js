module.exports = {
    authIsOwner: function (req, res) {
        return req.session.is_logined;
    },
    authStatusUI: function (req, res) {
        return this.authIsOwner(req) ? `${req.session.nickname} | <a href="/auth/logout">logout</a>` : '<a href="/auth/login">login</a>';
    }
};
