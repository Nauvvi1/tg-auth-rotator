const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxiesPath = path.resolve(__dirname, '../proxies.txt');

function getProxyByPhone(phoneNumber) {
  const lines = fs.readFileSync(proxiesPath, 'utf-8')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const index = Math.abs([...phoneNumber].reduce((acc, c) => acc + c.charCodeAt(0), 0)) % lines.length;
  const [proxyPart, rotateUrl] = lines[index].split('|');

  const parts = proxyPart.split(':');
  const host = parts[0];
  const port = parseInt(parts[1]);
  const username = parts[2];
  const password = parts.slice(3).join(':');

  return { host, port, username, password, rotateUrl };
}

async function rotateIpByPhone(phoneNumber, userAgent) {
  const proxy = getProxyByPhone(phoneNumber);

  if (proxy.rotateUrl) {
    try {
      console.log(`[DEBUG] Запрос на ротацию IP: ${proxy.rotateUrl}`);
      await axios.get(proxy.rotateUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': userAgent
        }
      });      
      console.log('[DEBUG] Ротация IP успешно выполнена');
    } catch (err) {
      console.warn('[WARN] Не удалось выполнить ротацию IP:', err.message);
    }
  }

  try {
    const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    const agent = new HttpsProxyAgent(proxyUrl);
  
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.ipify.org?format=json', {
      agent,
      headers: {
        'User-Agent': userAgent
      },
      timeout: 7000
    });
    
  
    const data = await response.json();
    console.log('[DEBUG] 🌍 Внешний IP через прокси:', data.ip);
  } catch (err) {
    console.warn('[WARN] Не удалось получить внешний IP через прокси:', err.message);
  }

  return proxy;
}

module.exports = { rotateIpByPhone };
