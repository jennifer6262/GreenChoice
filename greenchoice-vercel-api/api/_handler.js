// Vercel 서버리스용: server.js의 요청 처리기를 그대로 재사용 (listen은 하지 않음)
const http = require('node:http');
let handler;
const originalCreateServer = http.createServer;
http.createServer = (fn) => { handler = fn; return { listen() {} }; };
require('../server.js');
http.createServer = originalCreateServer;
module.exports = (path) => (req, res) => { req.url = path; return handler(req, res); };
