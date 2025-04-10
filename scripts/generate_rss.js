const axios = require('axios');
const cheerio = require('cheerio');
const RSS = require('rss');
const fs = require('fs');

const URL = 'https://today.hit.edu.cn/category/10';

async function fetchArticles() {
  const res = await axios.get(URL);
  const $ = cheerio.load(res.data);
  const items = [];

  $('ul.list_main_content > li').each((i, el) => {
    const a = $(el).find('a');
    const title = a.text().trim();
    const link = new URL(a.attr('href'), URL).href;
    const date = $(el).find('.time').text().trim();
    if (title && link) {
      items.push({ title, link, date });
    }
  });

  return await Promise.all(items.map(async item => {
    try {
      const res = await axios.get(item.link);
      const $ = cheerio.load(res.data);
      const content = $('.wp_articlecontent').html() || '';
      return {
        title: item.title,
        url: item.link,
        date: new Date(),
        description: content
      };
    } catch {
      return {
        title: item.title,
        url: item.link,
        date: new Date(),
        description: '获取失败'
      };
    }
  }));
}

async function main() {
  const feed = new RSS({
    title: '哈工大今日公告 RSS',
    feed_url: 'https://yourusername.github.io/hit-today-rss/feed.xml',
    site_url: 'https://today.hit.edu.cn/category/10',
    language: 'zh-cn'
  });

  const articles = await fetchArticles();
  articles.forEach(article => {
    feed.item(article);
  });

  const xml = feed.xml({ indent: true });
  fs.writeFileSync('./feed.xml', xml);
  console.log('RSS feed generated!');
}

main();
