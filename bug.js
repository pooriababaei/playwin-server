var qs = require('querystring');
var http = require('http');

var options = {
  method: 'PUT',
  hostname: 'localhost',
  port: '3001',
  path: '/users',
  headers: {
    authorization:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTI0NzYzZDFlYjFkNDQ0NmNkNTYxNGEiLCJ1c2VybmFtZSI6InBvb3JpYSIsInBob25lTnVtYmVyIjoiOTEzOTIzNjQ1MiIsImF2YXRhciI6ImJveS0xIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1Nzk0NDc4Njl9.fjGaUsyhqfMSWTciGOyREs1dHloUNssmeyd8vImPRRs'
    // 'content-type': 'application/x-www-form-urlencoded'
    // 'cache-control': 'no-cache'
    // 'postman-token': '71c23fad-def5-8394-5a1c-96a7b8d585cc'
  }
};

var req = http.request(options, function(res) {
  var chunks = [];

  res.on('data', function(chunk) {
    chunks.push(chunk);
  });

  res.on('end', function() {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.write(qs.stringify({ avatar: 'boy-34' }));
req.end();
