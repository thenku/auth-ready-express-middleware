require('dotenv').config();
import express from 'express';


import { setMyAuth } from './routes/routes';

const app = express();
const recaptcha = {siteKey: process.env.RECAPTCHA_SITE_KEY, secretKey: process.env.RECAPTCHA_SECRET_KEY};

setMyAuth(app, true, "privateOnly", recaptcha);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});