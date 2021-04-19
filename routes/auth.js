const express = require('express');
const router = express.Router();
const template = require('../libs/template');

module.exports = function (passport) {
    router.get('/login', (req, res, next) => {
        const fmsg = req.flash();
        let feedback = '';
        if (fmsg.message) {
            feedback = fmsg.message[0];
        }
        const title = "WEB - login";
        const list = template.list(req._list, '/topic');
        const html = template.HTML(title, list, `
        <div style="color:red;">${feedback}</div>
        <form action="${req.baseUrl}/login_process" method="post">
            <p><input type="text" name="email" placeholder="email"></p>
            <p><input type="password" name="pwd" placeholder="password"></p>
            <p><input type="submit" value="login"></p>
        </form>
        `, ``);

        res.send(html);
    });

    // passport는 내부적으로 express-session을 사용하기에 session을 활성화 시킨 다음에 passport가 등장해야 한다...
    // 사용자가 로그인 했을때 passport가 정보를 처리하게 하는 코드
    // app.post('/auth/login_process',
    //     // login 페이지에서 작성한 form을 passport가 받게함
    //     passport.authenticate('local', {
    //         //successRedirect: '/',
    //         failureRedirect: '/auth/login',
    //         failureFlash: true,
    //         successFlash: true
    //     }),
    //     // express session으로 session-file-store을 사용중
    //     // session 정보가 파일에 저장 후 redirection을 하기 위해서...
    //     // 위에 successRedirect: '/', 주석 처리 및...
    //     // 밑에 함수를 정의함
    //     (req, res) => {
    //         req.session.save((err) => {
    //             res.redirect('/');
    //         });
    //     }
    // );


    // 사용자가 로그인 했을때 passport가 정보를 처리하게 하는 코드
    // 위와 같은 일을 하지만... 지금 코드는 session을 파일로 관리하기에...
    // 위의 방식 말고 custom callback을 만들어 session 정보를 저장 후 redirect하는 방식을 사용
    router.post('/login_process', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (req.session.flash) {
                req.session.flash = {}
            }
            req.flash('message', info.message)

            req.session.save(() => {
                if (err) {
                    return next(err)
                }
                if (!user) {
                    return res.redirect('/auth/login')
                }
                req.logIn(user, (err) => {
                    if (err) {
                        return next(err)
                    }
                    // redirect after saving the flash data into the session file
                    return req.session.save(() => {
                        res.redirect('/')
                    })
                })
            })

        })(req, res, next);
    })

    router.get('/logout', (req, res, next) => {
        req.logout();

        // redirect하기 전에 session 파일에 업데이트 
        // 안그러면 redirect가 먼저 발생하여 logout 상태가 유지되지 않음
        // req.session.destroy((err) => {
        //    res.redirect('/');
        // });
        req.session.save((err) => {
            res.redirect('/');
        });
    });

    return router;
}