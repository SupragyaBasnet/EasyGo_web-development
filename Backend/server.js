const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket');

const port = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const server = http.createServer(app);

initializeSocket(server);

server.listen(port, HOST, () => {
    console.log(`Server is running on port ${port}`);
});
