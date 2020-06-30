const m3u8Parser = require('iptv-playlist-parser');
const convert = require( './core')(m3u8Parser);
const httpget = require('http').get;
const httpsget = require('https').get;
const fs = require('fs');

function get(url, cb) {
    (url.startsWith('https')?httpsget:httpget)(url, cb);
}

const url = process.argv[2];
const dest = process.argv[3] || 'iptv.txt';

console.log('url', url, 'dest', dest);

if (!url) {
    console.error('USAGE: node generate.js URL [ DEST_FILE ]');
    process.exitCode = 64;
    return;
}

get(url, (res) => {
  const { statusCode } = res;

  let error;
  if (statusCode !== 200) {
    error = new Error('Request Failed.\n' +
                      `Status Code: ${statusCode}`);
  }
  if (error) {
    console.error(error.message);
    // Consume response data to free up memory
    res.resume();
    process.exitCode = 1;
    return;
  }

  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    if (!res.complete) {
        console.error('The connection was terminated while the message was still being sent');
        process.exitCode = 1;
        return;
    }
    try {
      const txt = convert(rawData);
      fs.writeFileSync(dest, txt);
    } catch (e) {
      console.error(e.message);
      process.exitCode = 1;
    }
  });
});
