'use strict';

const crypto = require('crypto');

exports.md5 = function (content) {
	const md5 = crypto.createHash('md5');
	md5.update(content);
	return md5.digest('hex');
};

/**
 * Hash a password using PBKDF2 with a random salt.
 * Returns a "salt:hash" string suitable for storage.
 */
exports.hashPassword = function (password) {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
	return salt + ':' + hash;
};

/**
 * Verify a password against a stored "salt:hash" string.
 * Falls back to plain MD5 comparison for legacy records (no ':' separator).
 */
exports.verifyPassword = function (password, stored) {
	if (!stored) return false;
	if (stored.includes(':')) {
		const [salt, hash] = stored.split(':');
		const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
		return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
	}
	// Legacy: plain MD5 hash
	const md5 = crypto.createHash('md5');
	md5.update(password);
	return stored === md5.digest('hex');
};

exports.toBase64 = function (content) {
	return Buffer.from(content).toString('base64');
};

exports.fromBase64 = function (content) {
	return Buffer.from(content, 'base64').toString();
};
