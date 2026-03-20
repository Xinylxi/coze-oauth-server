// app.js 正确代码（仅声明一次express）
const express = require('express'); // 只写这一次！
const app = express();
const oauthRouter = require('./routes/oauth');

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 挂载路由
app.use('/oauth', oauthRouter);

// 测试接口
app.get('/test', (req, res) => {
  res.send('服务运行正常！端口：' + (process.env.PORT || 3000));
});

// 端口配置（核心：兼容云托管和本地）
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`服务启动：端口=${port}（云托管=${process.env.PORT}，本地=${3000}）`);
});

module.exports = app;