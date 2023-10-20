// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const app = express();
// const cors = require('cors');

// // Middleware for parsing JSON requests
// app.use(bodyParser.json());
// // Enable all CORS requests
// app.use(cors());
// // Set up static file serving
// app.use(express.static('public'));
// require('dotenv').config();


// // Connect to MongoDB
// mongoose.connect(process.env.MONGODBURL, { useNewUrlParser: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Error connecting to MongoDB:', err));
//   // Start the server
// app.listen(process.env.PORT, () => {
//   console.log(`Server started on port ${process.env.PORT}`);
// });
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const mongoose = require("mongoose")
require('dotenv').config();

// const io = socketIo(server);
mongoose.connect("mongodb://127.0.0.1:27017/blogChatDB", { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));
// Set up static file serving
app.use(express.static('public'));

// Enable all CORS requests
const corsOptions = {
  origin: 'http://localhost:3000', // Adjust this to match your React frontend URL
  methods: ['GET', 'POST'], // Add any other HTTP methods you need
};
// app.use(cors());
// Enable the cors middleware for socket.io
const io = socketIo(server, {
  cors: corsOptions,
});
const PORT = process.env.PORT; // Port for the API
console.log(PORT);
// Store connected clients
const connectedClients = {};

// Middleware to handle CORS and JSON parsing
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Socket.io connection event
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming messages
  socket.on('message', (message) => {
    console.log(message);
    // Broadcast the message to all connected clients
    io.emit('message', message);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// apis
const userRoutes = require('./routes/userRoute');
app.use('/users', userRoutes);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
