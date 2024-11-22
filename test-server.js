const express = require('express');
const app = express();
app.get('/api/test', (req, res) => res.json({ message: 'Test работает!' }));
app.listen(3000, () => console.log('Сервер запущен на порту 3000'));
