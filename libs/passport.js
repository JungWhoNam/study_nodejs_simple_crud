const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports = function () {
    const authData = {
        // version system에 올릴때 password 값을 올리지 말기!!!
        // 또한 값을 암호화해서 개발자도 모르게 해야함
        email: 'jung@gmail.com',
        password: '1234',
        nickname: 'jung'
    }

    // 로그인에 성공할때 불러지는 콜백 함수
    // 성공 시 session-store에 저장
    passport.serializeUser(function (user, done) {
        // sessions에 데이터의 'user' property에 저장
        done(null, user.email);
    });

    // 로그인 성공 후 새로운 페이지를 방문할 때마다 불러지는 콜백 함수
    // session-store에서 식별자를 가져와서 사용자의 실제 테이터를 가져옴 
    passport.deserializeUser(function (id, done) {
        // 현재 코드는 한명의 유저만 관리하기에 id를 사용해서 search 불필요
        // done 이후 req.user의 객체를 통해 주입된 두 번째 인자의 값을 access함
        done(null, authData);
    });

    // 로그인에 성공 or 실패를 판별하는 코드
    passport.use(new LocalStrategy(
        // by default, LocalStrategy expects parameters named username and password. In our case, we have named these fields differently.
        {
            usernameField: 'email',
            passwordField: 'pwd'
        },
        function (username, password, done) {
            if (username === authData.email) {
                if (password === authData.password) {
                    return done(null, authData, {
                        message: 'Welcome.'
                    });
                }
                else {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }
            }
            else {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
        }
    ));
}