const IMAP = require('imap');
const { simpleParser } = require('mailparser');

module.exports = {
	getLastEmail
};

/**
 * Fetches, formats, and returns the most recent email sent to a gmail account.
 *
 * @param {Object} opts imap config options
 * @param {String} opts.user Email account to fetch
 * @param {String} opts.password Passsword of the email account
 * @param {String} [opts.host=imap.gmail.com] Email host. Defaults to `"imap.gmail.com"`
 * @param {Number} [opts.port=993] Email host port. Defaults to `993`
 * @param {Boolean} [opts.tls=true] Whether the email host uses tls. Defaults to `true`
 * @param {String} [opts.mailbox=[Gmail]/All Mail] Mailbox to fetch the most recent email from. Defaults to `"[Gmail]/All Mail"`
 * @returns {Promise<Object>} The most recent email sent to the provided account
 */
async function getLastEmail(opts = {}) {
	if (!opts.user || !opts.password) {
		throw new Error('user and password are required params');
	}

	// Default the required params
	opts.host ??= 'imap.gmail.com';
	opts.port ??= 993;
	opts.tls ??= true;
	opts.mailbox ??= '[Gmail]/All Mail';

	const gmail = new IMAP(opts);

	return new Promise((resolve, reject) => {
		gmail.once('ready', function () {
			gmail.openBox(opts.mailbox, true, function (err, box) {
				if (err) {
					gmail.end();
					return reject(err);
				}

				let error;
				const fetcher = gmail.seq.fetch(box.messages.total + ':*', { bodies: '' });

				fetcher.on('message', function (msg) {
					msg.once('body', function (stream, _info) {
						let buffer = '';
						stream.on('data', function (chunk) {
							buffer += chunk.toString('utf8');
						});
						stream.once('end', function () {
							if (error) {
								return;
							}
							simpleParser(buffer, function (_err, mail) {
								if (_err) {
									return reject(_err);
								}
								return resolve(mail);
							});
						});
					});
				});

				fetcher.once('error', function (err) {
					return reject(err);
				});

				fetcher.once('end', function () {
					gmail.end();
				});
			});
		});

		gmail.on('error', function (err) {
			gmail.end();
			return reject(err);
		});

		gmail.connect();
	});
}
