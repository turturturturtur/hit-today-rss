const axios = require('axios');
const cheerio = require('cheerio');
const RSS = require('rss');
const fs = require('fs');

const baseUrl = 'https://today.hit.edu.cn';
const targetUrl = `${baseUrl}/category/10`;

async function getFullContent(url) {
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    // 正文内容（你可根据实际结构微调）
    const contentHtml = $('.field--name-body').html() || $('.content').html() || '';
    return contentHtml.trim();
  } catch (err) {
    console.error(`❌ 抓取失败：${url}`);
    return '（正文抓取失败）';
  }
}

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

  const items = $('ul.paragraph.list-tooltip li').slice(0, 10).toArray(); // 只抓10条防止太慢

  for (const el of items) {
    const a = $(el).find('span.title.top a');
    const title = a.text().trim();
    const link = baseUrl + a.attr('href');
    const dateText = $(el).find('.date').text().trim();

    const content = await getFullContent(link);

    feed.item({
      title,
      description: title,
      url: link,
      date: new Date(), // 你也可以 parse dateText
      custom_elements: [{ 'content:encoded': content }]
    });
  }

  fs.writeFileSync('feed.xml', feed.xml({ indent: true }));
})();
