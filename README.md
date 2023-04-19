# last-gmail

Simple wrapper around imap and mailparser that fetches, parses, and returns the most recent email that has been received by a gmail account.

## Usage

Simply require in `last-gmail`, pass in the account details (only `user` and `password` are required, all other are optional and are documented [here](https://github.com/mscdex/node-imap#connection-instance-methods)), and call `getLastEmail`. The async function returns the results, and any errors are thrown.

```javascript
const gmail = require('last-gmail');

const opts = {
    user: 'example@gmail.com',
    password: 'password',
    mailbox: 'INBOX' // Optional, default: [Gmail]/All Mail
};

try {
    const email = await gmail.getLastEmail(opts);

    console.log('to:', email.to);
    console.log('from:', email.from);
    email.text && console.log('text:', email.text);
    email.html && console.log('html:', email.html);
} catch (err) {
    console.error(err);
}
```
