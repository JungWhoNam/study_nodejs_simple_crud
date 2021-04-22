const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const bcrypt = require('bcrypt');
const db = require('../libs/db');
const googleCredentials = require('../config/google.json');

module.exports = function () {

    // 로그인에 성공할때 불러지는 콜백 함수
    passport.serializeUser(function (user, done) {
        // sessions에 데이터의 'user' property에 저장
        done(null, user.id);
    });

    // 로그인 성공 후 새로운 페이지를 방문할 때마다 불러지는 콜백 함수
    passport.deserializeUser(function (id, done) {
        // done 이후 req.user의 객체를 통해 주입된 두 번째 인자의 값을 access함
        const user = db.get('users').find({ id: id }).value();
        done(null, user);
    });

    // 로그인에 성공 or 실패를 판별하는 코드
    passport.use(new LocalStrategy(
        // by default, LocalStrategy expects parameters named username and password. In our case, we have named these fields differently.
        // authenticate 방법 사용시 사용 가능
        {
            usernameField: 'email',
            passwordField: 'pwd'
        },
        // log-in 할때 콜 되는 함수
        function (email, password, done) {
            const user = db.get('users').find({
                email: email
            }).value();

            if (user) {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result) {
                        // serializeUser 콜
                        return done(null, user, {
                            message: 'Welcome.'
                        });
                    }
                    else {
                        return done(null, false, {
                            message: 'Wrong password.'
                        });
                    }
                });
            }
            else {
                return done(null, false, {
                    message: 'Email does not exist.'
                });
            }
        }
    ));

    // Use the GoogleStrategy within Passport.
    // Strategies in Passport require a `verify` function, which accept credentials (in this case, an accessToken, refreshToken, and Google profile), and invoke a callback with a user object.
    passport.use(new GoogleStrategy({
        clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.client_secret,
        callbackURL: googleCredentials.web.redirect_uris[0]
    },
        function (accessToken, refreshToken, profile, done) {
            User.findOrCreate({ googleId: profile.id }, function (err, user) {
                return done(err, user);
            });
        }
    ));
    
}