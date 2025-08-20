const express = require('express');
const nodemailer = require('nodemailer');
const config = require('../config/env');
const { clients } = require('../telegram/authorizeStart');
const { getTelegramId } = require('../helpers/getTelegramId');
const { getUsedProxyInfo } = require('../utils/getUsedProxyInfo');
const { getProxy, deleteProxy } = require('../bot/services/proxyStore');
const { saveUserData } = require('../bot/services/userStore');
const { saveProfile } = require('../utils/registeredProfiles');
const { Api } = require('telegram');

const router = express.Router();
const emailCodes = new Map();

router.post('/submit-fullname', (req, res) => {
  const { phoneNumber, fullname } = req.body;
  res.render('email', {
    message: 'Теперь укажите email.',
    phoneNumber,
    fullname
  });
});

router.post('/submit-email', async (req, res) => {
  const { phoneNumber, fullname, email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  emailCodes.set(email, code);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
    logger: true,
  });

  await transporter.sendMail({
    from: '"Код подтверждения" securmailsupp@gmail.com',
    to: email,
    subject: 'Код подтверждения',
    text: `Ваш код подтверждения: ${code}`,
  });

  res.render('wait-email-code', {
    message: `📨 Код выслан на ${email}. Введите код из письма.`,
    phoneNumber,
    email,
    fullname,
  });
});

router.post('/verify-email-code', (req, res) => {
  const { email, code, fullname, phoneNumber } = req.body;
  const storedCode = emailCodes.get(email);

  if (storedCode === code) {
    emailCodes.delete(email);
    return res.render('final', {
      message: `🎉 Почта ${email} успешно подтверждена!`,
      phoneNumber,
      fullname,
      email,
    });
  }

  res.render('wait-email-code', {
    message: '❌ Неверный код. Попробуйте снова.',
    phoneNumber,
    fullname,
    email,
  });
});

router.post('/final-step', async (req, res) => {
  const { phoneNumber, fullname, email } = req.body;
  const telegramId = getTelegramId(phoneNumber);
  const client = clients.get(phoneNumber);

  if (!client) {
    return res.render('final', {
      message: '❌ Клиент Telegram не найден. Начните заново.',
      phoneNumber,
      fullname,
      email
    });
  }

  try {
    if (telegramId) {
      const [firstName, ...rest] = fullname.trim().split(' ');
      const lastName = rest.join(' ') || '';
  
      await client.invoke(
        new Api.account.UpdateProfile({
          firstName,
          lastName,
          about: 'Регистрация через бота',
        })
      );
      console.log('[DEBUG final-step]: Имя успешно установлено в Telegram');
  
      saveUserData(Number(telegramId), { fullname, email });
      saveProfile({
        phoneNumber,
        telegramId,
        fullname,
        email,
        sessionPath: `sessions/${phoneNumber}.session.json`,
        createdAt: new Date().toISOString()
      });
  
      await client.sendMessage(config.botUsername, {
        message: `/trigger_registration_done_${telegramId}`,
      });
  
      const proxy = getProxy(phoneNumber);
      if (proxy) {
        await getUsedProxyInfo(client, proxy);
        deleteProxy(phoneNumber);
      }
  
      await client.disconnect();
      clients.delete(phoneNumber);
    }
  
    res.render('complete', {
      message: '🎉 Всё готово!',
      phoneNumber,
      fullname,
      email
    });
  }
  catch (error) {
    res.render('final', {
      message: '❌ Ошибка при установке имени или отправке сообщения.',
      phoneNumber,
      fullname,
      email
    });
  }
});

module.exports = router;
