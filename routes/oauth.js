// routes/oauth.js 正确代码（仅声明1次express）
const express = require('express'); // 只保留这1次声明！
const router = express.Router();
const axios = require('axios');

// Coze配置（用环境变量，不要硬编码）
const COZE_CONFIG = {
  client_id: process.env.COZE_CLIENT_ID,
  client_secret: process.env.COZE_CLIENT_SECRET,
  token_url: 'https://www.coze.cn/openapi/v2/oauth/token',
  redirect_uri: 'https://api.dreamwormhole.cloud/oauth/callback'
};

// 回调路由
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('缺少授权码code');

    const tokenRes = await axios.post(COZE_CONFIG.token_url, null, {
      params: {
        grant_type: 'authorization_code',
        client_id: COZE_CONFIG.client_id,
        client_secret: COZE_CONFIG.client_secret,
        code,
        redirect_uri: COZE_CONFIG.redirect_uri
      }
    });

    res.send(`授权成功！Token：${tokenRes.data.access_token}`);
  } catch (err) {
    res.status(500).send(`授权失败：${err.message}`);
  }
});

module.exports = router;
