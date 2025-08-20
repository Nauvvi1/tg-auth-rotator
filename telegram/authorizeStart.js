const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const path = require('path');
const tunnel = require('tunnel');
const { rotateIpByPhone } = require('../utils/rotateIp');
const { getUsedProxyInfo } = require('../utils/getUsedProxyInfo');
const { saveProxy } = require('../bot/services/proxyStore');
const { generateRandomDevice } = require('../utils/randomDevice');
const { generateUserAgent } = require('../utils/userAgent');
const config = require('../config/env');

const apiId = Number(config.apiId);
const apiHash = config.apiHash;

const clients = new Map();
const sessionsDir = path.resolve(__dirname, '../sessions');

async function createHttpSocket(ip, port, proxy) {
  return new Promise((resolve, reject) => {
    const tunnelingAgent = tunnel.httpOverHttp({
      proxy: {
        host: proxy.host,
        port: proxy.port,
        proxyAuth: `${proxy.username}:${proxy.password}`,
      },
    });

    console.log(`[DEBUG] createHttpSocket подключается к Telegram через ${proxy.host}:${proxy.port}`);

    tunnelingAgent.createSocket({ host: ip, port }, (err, socket) => {
      if (err) {
        console.error('[ERROR] Не удалось создать сокет через прокси:', err.message);
        return reject(err);
      }
      resolve(socket);
    });
  });
}

async function authorizeStart(phoneNumber) {
  console.log('[DEBUG] authorizeStart запущен с номером:', phoneNumber);

  const { userAgent } = generateUserAgent();
  console.log('[DEBUG] 📱 Случайный User-Agent:', userAgent);

  const proxy = await rotateIpByPhone(phoneNumber, userAgent);
  saveProxy(phoneNumber, proxy);
  console.log('[DEBUG] Используем прокси:', proxy);

  const sessionPath = path.join(sessionsDir, `${phoneNumber}.session.json`);
  const stringSession = fs.existsSync(sessionPath)
    ? fs.readFileSync(sessionPath, 'utf-8')
    : '';

  const deviceInfo = generateRandomDevice();
  console.log('[DEBUG] Случайное устройство:', deviceInfo);

  const client = new TelegramClient(
    new StringSession(stringSession),
    apiId,
    apiHash,
    {
      connectionRetries: 5,
      deviceModel: deviceInfo.deviceModel,
      systemVersion: deviceInfo.systemVersion,
      appVersion: '9.5.2 (27901)',
      langCode: 'en',
      systemLangCode: 'en-GB',
      socket: {
        connect: async ({ ip, port }) => createHttpSocket(ip, port, proxy),
      },
    }
  );

  await client.connect();
  await getUsedProxyInfo(client, proxy);
  clients.set(phoneNumber, client);

  if (stringSession) {
    console.log(`[DEBUG] Сессия для ${phoneNumber} найдена. Повторная авторизация не требуется.`);
    return;
  }

  client.start({
    phoneNumber: () => Promise.resolve(phoneNumber),
    phoneCode: () => new Promise(() => {}),
    password: () => Promise.resolve(''),
    onError: (err) => {
      if (err.errorMessage === 'FLOOD') {
        console.error(`[FLOOD_WAIT]: Подожди ${err.seconds} секунд`);
      } else {
        console.error('[ERROR in start()]:', err);
      }
    },
  }).then(() => {
    console.log(`[DEBUG] Клиент ${phoneNumber} авторизован`);
  }).catch((err) => {
    console.error(`[ERROR] Ошибка авторизации ${phoneNumber}:`, err);
  });
}

module.exports = { authorizeStart, clients };
