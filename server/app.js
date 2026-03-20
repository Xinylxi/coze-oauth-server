const express = require('express');
const axios = require('axios');
const oauthRouter = require('../routes/oauth');
const app = express();
app.use(express.json()); // 解析JSON请求体

// OAuth 回调路由
app.use('/oauth', oauthRouter);

// 1. Coze API代理接口（转发小程序请求到Coze官方API）
app.post('/proxy/coze/chat', async (req, res) => {
  try {
    // 转发请求到Coze官方接口，携带客户端传入的Token
    const cozeRes = await axios.post(
      'https://api.coze.cn/open_api/v2/chat', 
      req.body,
      { headers: { 'Authorization': req.headers.authorization, 'Content-Type': 'application/json' } }
    );
    res.json(cozeRes.data); // 回传Coze响应给云函数
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: '代理请求失败' });
  }
});

// 2. 令牌刷新接口（用refresh_token获取新的access_token）
app.post('/refresh-token', async (req, res) => {
  try {
    const refreshRes = await axios.post(
      'https://api.coze.cn/open_api/v2/token/refresh', 
      { refresh_token: req.body.refresh_token },
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(refreshRes.data); // 返回新令牌给云函数
  } catch (err) {
    res.status(500).json({ error: '令牌刷新失败' });
  }
});

// 启动服务（云托管默认监听80端口）
app.listen(80, () => {
  console.log('云托管服务启动成功（端口80）');
});