const archiver = require('archiver');
const encryptedZip = require('archiver-zip-encrypted');

try {
  archiver.registerFormat('zip-encrypted', encryptedZip);
} catch (e) {
  // Format already registered, skip
}

/**
 * Create a password-protected ZIP archive and pipe it to a writable stream.
 * @param {Array<{name: string, buffer: Buffer}>} files - Array of {name, buffer}
 * @param {string} password - ZIP password
 * @param {WritableStream} outputStream - e.g., res (Express response)
 * @returns {Promise<void>}
 */
const createPasswordZip = (files, password, outputStream) => {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip-encrypted', {
      zlib: { level: 9 },
      encryptionMethod: 'aes256',
      password: password,
    });

    outputStream.on('close', () => resolve());
    archive.on('error', (err) => reject(err));
    
    archive.pipe(outputStream);

    for (const file of files) {
      archive.append(file.buffer, { name: file.name });
    }

    archive.finalize();
  });
};

module.exports = { createPasswordZip };
