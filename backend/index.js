const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Imports your Mongoose connection logic

// 1. Load configuration environment variables from your .env file
dotenv.config();

const app = express();

// 2. Connect cleanly to your MongoDB database collections
connectDB();

// 3. Enable Cross-Origin Resource Sharing (Allows Vite port 5173 to talk to Express port 5000)
app.use(cors());

// 4. Body Parser Middleware to process incoming JSON payloads (req.body)
app.use(express.json());

// 5. Link your Authentication endpoints router file
app.use('/api/auth', require('./routes/auth'));

// 6. Bind the application engine to listen on your designated system port
const PORT = process.env.PORT || 5000;
app.listen(PORT);