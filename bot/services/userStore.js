const userStore = new Map();

function saveUserData(telegramId, data) {
  userStore.set(telegramId, data);
}

function getUserData(telegramId) {
  return userStore.get(telegramId);
}

function clearUserData(telegramId) {
  userStore.delete(telegramId);
}

module.exports = {
  saveUserData,
  getUserData,
  clearUserData,
};
