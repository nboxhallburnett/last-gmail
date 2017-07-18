var Imap = require('imap'),
	MailParser = require('mailparser').MailParser;

/**
 * Fetches, formats, and returns the most recent email
 * sent to a gmail account.
 *
 * @param {object} opts imap config options
 * @param {function} callback
 *
 * @returns {object} The most recent email sent to the provided account
 */
module.exports.getLastEmail = function (opts, callback) {
	if (!opts.user || !opts.password) {
		return callback(new Error('user and password are required params'));
	}

	// Default the required params
	!opts.host && (opts.host = 'imap.gmail.com');
	!opts.port && (opts.port = 993);
	!opts.tls && (opts.tls = true);

	var gmail = new Imap(opts);

	gmail.once('ready', function () {
		gmail.openBox('[Gmail]/All Mail', true, function (err, box) {
			if (err) {
				gmail.end();
				return callback(err);
			}

			var error;

			var fetcher = gmail.seq.fetch(box.messages.total + ':*', { bodies: '' });

			fetcher.on('message', function (msg) {
				msg.once('body', function (stream, info) {
					var buffer = '';
					stream.on('data', function (chunk) {
						buffer += chunk.toString('utf8');
					});
					stream.once('end', function () {
						var parser = new MailParser();
						parser.once('end', function (mail) {
							return callback(error, mail);
						});
						parser.write(buffer);
						parser.end();
					});
				});
			});
			fetcher.once('error', function (err) {
				error = err;
			});
			fetcher.once('end', function () {
				gmail.end();
			});
		});
	});
	gmail.on('error', function(err) {
		gmail.end();
		return callback(err);
	});

	gmail.connect();
};
