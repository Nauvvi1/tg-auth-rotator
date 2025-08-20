const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    message: 'Нажмите "Запустить регистрацию", чтобы начать.',
    phoneNumber: null,
  });
});

router.post('/back-to-start', (req, res) => {
  res.redirect('/');
});

module.exports = router;
