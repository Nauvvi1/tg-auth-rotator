const devices = require('../assets/devices.json');

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomDevice() {
  const entry = getRandomElement(devices);
  return {
    deviceModel: getRandomElement(entry.models),
    systemVersion: `Android ${getRandomElement(entry.versions)}`,
    manufacturer: entry.manufacturer,
  };
}

module.exports = { generateRandomDevice };
