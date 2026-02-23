//----------TYPE 1
// const http = require("http");
// const table = {"name": "abigail", "age": 34, "dob": "17th march 2002"};


// const server = http.createServer((req,res)=>{
//     res.writeHead(200, { "content-Type": "text/html" });
//     res.end("<a href='https://www.google.com'>Google text</a>");
// });


// server.listen(3000, () => {
// console.log('Listening on http://localhost:3000');
// });

//---------------TYPE 2
// const http = require("http");

// // Create a local server to receive data from
// const server = http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'application/json' });
//   res.end(JSON.stringify({
//     data: 'Hello World!',
//   }));
// });

// server.listen(8000);

// const http = require("http");

