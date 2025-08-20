const { findByPhone } = require('../utils/registeredProfiles');


function getTelegramId(phoneNumber) {
  const profile = findByPhone(phoneNumber);
  return profile?.telegramId || null;
}

module.exports = { getTelegramId };
