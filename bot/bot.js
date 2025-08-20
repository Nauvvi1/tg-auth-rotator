const { Bot } = require('grammy');
const config = require('../config/env');
const { getUserData, clearUserData } = require('./services/userStore'); // ✅ добавили
const bot = new Bot(config.botToken);

bot.command('start', async (ctx) => {
    await ctx.reply(
      `🎉 Добро пожаловать!
  
  Вы успешно авторизовались через Telegram клиента. 🚀
  
  Чтобы завершить регистрацию, дождитесь окончания заполнения формы на сайте.`
    );
  
    try {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
    } catch (err) {
      console.warn('[WARN] Не удалось удалить сообщение /start:', err.message);
    }
  });
  

bot.on('message:text', async (ctx) => {
  const text = ctx.message.text;
  const telegramId = ctx.from?.id;

  if (text === `/trigger_registration_done_${telegramId}`) {
    const data = getUserData(telegramId);

    if (data) {
      await ctx.reply(
        `✅ Регистрация завершена!\nФИО: ${data.fullname}\nEmail: ${data.email}`
      );
      clearUserData(telegramId);
    } else {
      await ctx.reply('❌ Данные не найдены. Попробуйте снова.');
    }

    try {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
    } catch (err) {
      console.warn('[WARN] Не удалось удалить сообщение:', err.message);
    }
  }
});

bot.start();
console.log('🤖 Бот запущен');

module.exports = { bot };
