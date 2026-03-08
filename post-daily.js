#!/usr/bin/env node

require('dotenv').config({ path: '.env' });

const fs = require('fs');
const https = require('https');
const querystring = require('querystring');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

// Load products
const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const randomProduct = products.products[Math.floor(Math.random() * products.products.length)];

// Format tweet
const tweetText = `🔧 Günün Ürünü: ${randomProduct}\n\n✨ Gül-Tekin Mühendislik ile kaliteli çözümler!\n\n👉 Tüm ürünler: gul-tekinmuhendislik.com/urunler`;

console.log('📢 Posting:', tweetText);

// Twitter OAuth 1.0a
const oauth = new OAuth({
  consumer: {
    key: process.env.TWITTER_CONSUMER_KEY,
    secret: process.env.TWITTER_CONSUMER_SECRET
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});

const twitterPost = async () => {
  const request_data = {
    url: 'https://api.twitter.com/1.1/statuses/update.json',
    method: 'POST',
    data: { status: tweetText }
  };
  
  const auth_header = oauth.toHeader(
    oauth.authorize(request_data, {
      key: process.env.TWITTER_ACCESS_TOKEN,
      secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    })
  );
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.twitter.com',
      path: '/1.1/statuses/update.json',
      method: 'POST',
      headers: {
        'Authorization': auth_header['Authorization'],
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    
    const body = querystring.stringify({ status: tweetText });
    options.headers['Content-Length'] = body.length;
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Twitter posted successfully');
          resolve(true);
        } else {
          console.error('❌ Twitter error:', res.statusCode, data);
          reject(new Error(`Twitter: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// Facebook Graph API
const facebookPost = async () => {
  const params = querystring.stringify({
    message: tweetText,
    access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  });
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.facebook.com',
      path: `/v12.0/${process.env.FACEBOOK_PAGE_ID}/feed?${params}`,
      method: 'POST',
      headers: {
        'Content-Length': 0
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Facebook posted successfully');
          resolve(true);
        } else {
          console.error('❌ Facebook error:', res.statusCode, data);
          reject(new Error(`Facebook: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
};

// Main
(async () => {
  try {
    await Promise.all([twitterPost(), facebookPost()]);
    console.log('✨ All posts sent successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
