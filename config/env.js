require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
//   sessionsDir: process.env.SESSIONS_DIR || path.resolve(__dirname, '../sessions'),
//   proxiesPath: process.env.PROXIES_PATH || path.resolve(__dirname, '../proxies.txt'),

  apiId: Number(process.env.API_ID),
  apiHash: process.env.API_HASH,
  botUsername: process.env.BOT_USERNAME,
  botToken: process.env.BOT_TOKEN,

  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
};
