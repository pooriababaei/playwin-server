var http = require('http');

var options = {
  method: 'POST',
  hostname: 'https://api.playwin.ir',
  port: null,
  path: '/leagues',
  headers: {
    'content-type':
      'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
    authorization:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTIxYTZlNTlkNDJlOTFjNmMyZWRlNzUiLCJ1c2VybmFtZSI6InBvb3JpeWEiLCJlbWFpbCI6InBvb3JpeWEuYmFiYWVpLjE5OTdAZ21haWwuY29tIiwicm9sZSI6InN1cGVyYWRtaW4iLCJpYXQiOjE1NzkyNjM3NDF9.U6PjBPdOyO_TDYaFSnHzuQdUvI10ihf2-8bv8JArOJ4',
    'cache-control': 'no-cache',
    'postman-token': '1706d7df-09e6-4366-04d9-8b2289b09a1c'
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

req.write(
  '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="name"\r\n\r\nدراسام\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="collectionName"\r\n\r\ndrawsum1\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="description"\r\n\r\nبه ۱۰۰ نفر برتر هر کدام ۱۰ هزار تومان جایزه تعلق میگیرد.\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="defaultOpportunity"\r\n\r\n10\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="mainImage"; filename="Screenshot (115).png"\r\nContent-Type: image/png\r\n\r\n\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="startTime"\r\n\r\n2019-02-21T05:59:13.793\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="endTime"\r\n\r\n2020-11-28T16:49:13.793\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="available"\r\n\r\ntrue\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="kind"\r\n\r\n1\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="game"; filename="drawsum.zip"\r\nContent-Type: application/zip\r\n\r\n\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="images"; filename="Screenshot (115).png"\r\nContent-Type: image/png\r\n\r\n\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="reward"\r\n\r\n1000000\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--'
);
req.end();
