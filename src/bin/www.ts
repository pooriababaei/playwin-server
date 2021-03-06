#!/usr/bin/env node

/**
 * Module dependencies.
 */
import Debug from 'debug';
const debug = Debug('www:');

import http from 'http';
import app from '../app';
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle collectionNameific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  debug('Listening on ' + bind);

}

// Code to run if we're in the master process
// if (cluster.isMaster) {

//     // Count the machine's CPUs
//     var cpuCount = require('os').cpus().length;

//     // Create a worker for each CPU
//     for (var i = 0; i < cpuCount/2; i += 1) {
//         cluster.fork();
//     }

//     // Listen for dying workers
//     cluster.on('exit', function (worker) {

//         // Replace the dead worker, we're not sentimental
//         debug('Worker %d died :(', worker.id);
//         cluster.fork();

//     });

// // Code to run if we're in a worker process
// } else {
//     // Bind to a port
//     server.listen(port);
//     server.on('error', onError);
//     server.on('listening', onListening);
//     debug('Worker %d running!', cluster.worker.id);

// }


 /**
  * Normalize a port into a number, string, or false.
  * */
