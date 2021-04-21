const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = '111111';
const someOtherPlaintextPassword = '111112';

bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
    console.log('created hash', hash);

    bcrypt.compare(myPlaintextPassword, hash, function (err, result) {
        console.log('myPlaintextPassword', result);
    });

    bcrypt.compare(someOtherPlaintextPassword, hash, function (err, result) {
        console.log('someOtherPlaintextPassword', result);
    });
});