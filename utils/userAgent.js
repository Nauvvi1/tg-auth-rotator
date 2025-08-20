const devices = require('../assets/devices.json');

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUserAgent() {
  const device = getRandomItem(devices);
  const model = getRandomItem(device.models);
  const version = getRandomItem(device.versions);

  const userAgent = `Mozilla/5.0 (Linux; Android ${version}; ${model}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36`;

  return {
    userAgent,
    deviceInfo: {
      deviceModel: model,
      systemVersion: `Android ${version}`,
      manufacturer: device.manufacturer,
    }
  };
}

module.exports = { generateUserAgent };
