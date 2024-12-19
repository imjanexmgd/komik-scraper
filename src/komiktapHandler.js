import axios from 'axios';
// KOMIKTAP-JS
// Unofficial web scraping tool for the Komiktap website
// Website: https://komiktap.info/
// DISCLAIMER: This project is not affiliated with or endorsed by Komiktap. Use it responsibly.

export const getKomikDetail = async (comicTitle) => {
  try {
    const { data } = await axios.get(
      `https://komiktap.info/manga/${comicTitle}/`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept-Encoding': 'br,gzip',
          referer: 'https://komiktap.info/',
          'cache-control': 'max-age=600',
        },
      }
    );

    const $ = cheerio.load(data);
    const info = {};
    $('.infotable tr').each((_, element) => {
      const key = $(element).find('td').first().text().trim();
      const value = $(element).find('td').last().text().trim();
      info[key] = value;
    });
    const genres = $('.seriestugenre a')
      .map((_, el) => $(el).text().trim())
      .get();
    const chapterLinks = $('#chapterlist li .eph-num a')
      .map((_, el) => $(el).attr('href'))
      .get();
    const thumbnail = $('div.seriestucontl > div.thumb > img').attr('src');
    const title = $('.entry-title[itemprop="name"]').text().trim();
    const result = {
      title,
      thumbnail,
      ...info,
      Genres: genres,
      chapter: chapterLinks,
    };

    console.log(result);
  } catch (error) {
    console.log('Error:', error.message);
  }
};
