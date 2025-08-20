const fs = require('fs');
const path = require('path');
const { clients } = require('./authorizeStart');
const config = require('../config/env');
const { saveProfile, findByPhone } = require('../utils/registeredProfiles');

const sessionsDir = path.resolve(__dirname, '../sessions');
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

async function authorizeFinish(phoneNumber, code, password = '') {
  const client = clients.get(phoneNumber);
  if (!client) throw new Error('Клиент не найден. Начните сначала.');

  const sessionPath = path.join(sessionsDir, `${phoneNumber}.session.json`);
  const sessionExistsBefore = fs.existsSync(sessionPath);

  try {
    await client.start({
      phoneNumber: () => Promise.resolve(phoneNumber),
      phoneCode: () => Promise.resolve(code),
      password: () => Promise.resolve(password || ''),
    });
  } catch (e) {
    if (e.errorMessage === 'SESSION_PASSWORD_NEEDED') {
      throw new Error('SESSION_PASSWORD_NEEDED');
    }
    throw e;
  }

  fs.writeFileSync(sessionPath, client.session.save());
  console.log('[DEBUG] Сессия сохранена:', sessionPath);

  try {
    const me = await client.getMe();
    const telegramId = me.id;

    const existing = findByPhone(phoneNumber);
    if (existing) {
      existing.telegramId = telegramId;
      saveProfile(existing);
      console.log(`[DEBUG] Telegram ID ${telegramId} обновлён для номера ${phoneNumber}`);
    } else {
      saveProfile({ phoneNumber, telegramId });
      console.log(`[DEBUG] Telegram ID ${telegramId} сохранён как новый профиль для ${phoneNumber}`);
    }
  } catch (err) {
    console.warn(`[WARN] Не удалось сохранить telegramId для ${phoneNumber}:`, err.message);
  }

  if (!sessionExistsBefore) {
    try {
      await client.sendMessage(config.botUsername, {
        message: '/start',
      });
      console.log('[DEBUG] Отправлена команда /start боту (первая авторизация)');
    } catch (err) {
      console.warn('[WARN] Не удалось отправить /start боту:', err.message);
    }
  }
}

module.exports = { authorizeFinish };
