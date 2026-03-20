// routes/oauth.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const COZE_CONFIG = {
  client_id: process.env.COZE_CLIENT_ID,
  client_secret: process.env.COZE_CLIENT_SECRET,
  token_url: 'https://api.coze.cn/api/permission/oauth2/token',
  redirect_uri: 'https://api.dreamwormhole.cloud/oauth/callback'
};

router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('缺少授权码code');

    // ✅ 正确：body中不要包含client_secret
    const body = { 
      grant_type: 'authorization_code', 
      client_id: COZE_CONFIG.client_id,
      code, 
      redirect_uri: COZE_CONFIG.redirect_uri 
    };

    let tokenRes;
    try {
      tokenRes = await axios.post(COZE_CONFIG.token_url, body, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${COZE_CONFIG.client_secret}`  // ✅ client_secret放在这里
        }
      });
    } catch (e1) {
      console.warn('第一请求失败，尝试备用URL', e1.response?.data || e1.message);
      const fallbackUrl = 'https://api.coze.cn/open_api/v2/token';
      tokenRes = await axios.post(fallbackUrl, body, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${COZE_CONFIG.client_secret}`
        }
      });
    }

    const result = tokenRes.data || {};
    const payload = result.data || result;
    const accessToken = payload.access_token || payload.token || payload.result?.access_token;
    const refreshToken = payload.refresh_token || payload.refresh;
    const expiresIn = payload.expires_in || payload.expires || payload.expiry;

    if (!accessToken) {
      return res.status(500).send(`授权成功但未获取access_token，返回数据：${JSON.stringify(result)}`);
    }

    // 存储（示例：全局变量，生产请用数据库/Redis）
    global.cozeAccessToken = accessToken;
    global.cozeRefreshToken = refreshToken;
    global.cozeTokenExpires = Date.now() + (expiresIn || 7200) * 1000;

    return res.send(`授权成功！Token：${accessToken}`);
  } catch (err) {
    console.error('OAuth callback error:', err.response?.data || err.message);
    res.status(500).send(`授权失败：${err.response?.data?.msg || err.message}`);
  }
});

module.exports = router;