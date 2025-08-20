const express = require('express');
const router = express.Router();

router.post('/back-to-fullname', (req, res) => {
  const { phoneNumber, fullname } = req.body;
  res.render('fullname', {
    message: '⬅ Вернулись к вводу ФИО.',
    phoneNumber,
    fullname,
  });
});

router.post('/back-to-phone', (req, res) => {
  res.render('index', {
    message: '⬅ Вернулись к вводу номера.',
    phoneNumber: null,
  });
});

router.post('/back-to-email', (req, res) => {
  const { phoneNumber, fullname, email } = req.body;
  res.render('email', {
    message: '⬅ Вернулись к вводу email.',
    phoneNumber,
    fullname,
    email
  });
});

module.exports = router;
