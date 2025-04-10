const axios = require('axios');
const cheerio = require('cheerio');
const RSS = require('rss');
const fs = require('fs');

const baseUrl = 'https://today.hit.edu.cn';
const targetUrl = `${baseUrl}/category/10`;

(async () => {
  const { data } = await axios.get(targetUrl);
  const $ = cheerio.load(data);

  const feed = new RSS({
    title: '哈工大今日公告 RSS',
    description: '哈工大今日公告 RSS',
    feed_url: 'https://turturturturtur.github.io/hit-today-rss/feed.xml',
    site_url: targetUrl,
    language: 'zh-cn',
  });

  $('ul.paragraph.list-tooltip li').each((_, el) => {
    const a = $(el).find('span.title.top a');
    const title = a.text().trim();
    const link = baseUrl + a.attr('href');
    const date = $(el).find('.date').text().trim();

    feed.item({
      title,
      description: title,
      url: link,
      date: new Date(), // 或可以做进一步处理
    });
  });

  fs.writeFileSync('feed.xml', feed.xml({ indent: true }));
})();
