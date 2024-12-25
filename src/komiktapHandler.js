import axios from 'axios';
import * as cheerio from 'cheerio';
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
      success: 'true',
      data: {
        title,
        thumbnail,
        ...info,
        Genres: genres,
        chapter: chapterLinks,
      },
    };

    return result;
  } catch (error) {
    console.log('Error:', error.message);
  }
};
export const getChapter = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Encoding': 'br,gzip',
        referer: 'https://komiktap.info/',
        'cache-control': 'max-age=600',
      },
    });
    const $ = cheerio.load(data);
    const scriptContent = $('script')
      .filter((i, el) => {
        return $(el).html().includes('ts_reader.run');
      })
      .html();
    const match = scriptContent.match(/ts_reader\.run\((\{.*\})\);/s);
    if (match && match[1]) {
      const json = JSON.parse(match[1]);
      if (!json.sources) {
        return {
          success: false,
        };
      }
      if (!json.sources[0].images) {
        return {
          success: false,
        };
      }
      const data = json.sources[0].images;
      return {
        success: true,
        data: {
          url,
          images: data,
        },
      };
    } else {
      return {
        success: false,
      };
    }
  } catch (error) {
    console.log(`Error : ${error.message}`);
  }
};
