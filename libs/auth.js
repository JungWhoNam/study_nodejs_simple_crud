module.exports = {
    authIsOwner: function (req, res) {
        return req.user;
    },
    authStatusUI: function (req, res) {
        return this.authIsOwner(req) ? 
        `${req.user.email} | <a href="/auth/logout">logout</a>` : 
        '<a href="/auth/login">login</a> | <a href="/auth/register">Register</a>';
    }
};
