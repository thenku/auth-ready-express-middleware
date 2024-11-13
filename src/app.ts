require('dotenv').config();
import express from 'express';


import { setMyAuth } from './routes/routes';

const app = express();

setMyAuth(app, true, "privateOnly");

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});