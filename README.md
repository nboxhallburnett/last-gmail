last-gmail
==========

Simple wrapper around imap and mailparser that fetches, parses, and returns the most recent email that has been received by a gmail account.

Usage
---

Simply require in `last-gmail`, pass in the account details (only `user` and `password` are required, all other are optional and are documented [here](https://github.com/mscdex/node-imap#connection-instance-methods)), and call `getLastEmail`. The function returns the results, and any errors, in the callback param.

```javascript
var gmail = require('last-gmail');

var opts = {
    user: 'example@gmail.com',
    password: 'password'
};

gmail.getLastEmail(opts, function (err, email) {
    if (err) {
        return console.error(err);
    }
    console.log('to:', email.to);
    console.log('from:', email.from);
    email.text && console.log('text:', email.text);
    email.html && console.log('html:', email.html);
});
```
