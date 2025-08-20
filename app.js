const express = require('express');
const path = require('path');
const config = require('./config/env');

const app = express();
const port = config.port;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

require('./bot/bot');

app.use('/', require('./routes/index.routes'));
app.use('/', require('./routes/auth.routes'));
app.use('/', require('./routes/profile.routes'));
app.use('/', require('./routes/navigation.routes'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
