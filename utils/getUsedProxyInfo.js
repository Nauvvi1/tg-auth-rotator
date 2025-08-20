const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { Api } = require('telegram');

async function getUsedProxyInfo(client, proxy) {
  try {
    const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    const agent = new HttpsProxyAgent(proxyUrl);
    const fetch = (await import('node-fetch')).default;

    const res = await fetch('https://api.ipify.org?format=json', { agent, timeout: 5000 });
    const data = await res.json();
    console.log('[DEBUG] 🌍 Внешний IP через прокси:', data.ip);
  } catch (err) {
    console.warn('[WARN] ⚠ Не удалось получить внешний IP через прокси:', err.message);
  }

  try {
    const result = await client.invoke(new Api.help.GetConfig());
    console.log('[DEBUG] 📡 Используемый DC:', result.thisDc);
    console.log('[DEBUG] 🌐 Все доступные DC:', result.dcOptions.map(dc => ({
      id: dc.id,
      ipAddress: dc.ipAddress,
      port: dc.port,
      country: dc.country,
    })));
  } catch (err) {
    console.warn('[WARN] ⚠ Не удалось получить DC через client.invoke:', err.message);
  }
}

module.exports = { getUsedProxyInfo };
