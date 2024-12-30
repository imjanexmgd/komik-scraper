import axios from 'axios';
// KOMIKTAP-JS
// Unofficial web scraping tool for the Komiktap website
// Website: https://komiktap.info/
// DISCLAIMER: This project is not affiliated with or endorsed by Komiktap. Use it responsibly.

const extractText = (pattern, input) => {
  const match = input.match(pattern);
  return match ? match[1].trim() : null;
};

export const getKomikDetail = async (comicTitle) => {
  try {
    const { data } = await axios.get(
      `https://komiktap.info/manga/${comicTitle}/`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
          'Accept-Encoding': 'br,gzip',
          referer: 'https://komiktap.info/',
          'cache-control': 'max-age=600',
        },
      }
    );

    let info = {};
    const infoMatch = data.match(
      /<table class="infotable">([\s\S]*?)<\/table>/g
    );

    if (infoMatch && infoMatch[0]) {
      [...infoMatch[0].matchAll(/<td>(.*?)<\/td>\s*<td>(.*?)<\/td>/g)].forEach(
        (e) => {
          const label = e[1].trim();
          let value = e[2]
            .trim()
            .replace(/<[^>]+>/g, '')
            .trim();
          info[label] = value;
        }
      );
    }
    const genresMatch = data.match(
      /<div[^>]*class="seriestugenre"[^>]*>(.*?)<\/div>/
    );
    let genres = [];
    if (genresMatch && genresMatch[1]) {
      genres = [
        ...genresMatch[1].matchAll(/<a[^>]*href="[^"]+"[^>]*>([^<]+)<\/a>/g),
      ].map((match) => match[1].trim());
    }
    const chapterDetails = [];
    const chapterMatches = data.matchAll(
      /<li[^>]*>\s*<div[^>]*class="chbox"[^>]*>.*?<a[^>]*href="([^"]+)"[^>]*>.*?<span[^>]*class="chapternum"[^>]*>([^<]+)<\/span>/g
    );

    for (const match of chapterMatches) {
      if (match[1].startsWith('https://')) {
        chapterDetails.push({
          url: match[1].trim(),
          chapter: match[2].trim(),
        });
      }
    }

    const thumbnail = extractText(
      /<div\s+class="thumb"[^>]*>\s*<img[^>]*src="([^"]+)"/,
      data
    );
    const title = extractText(
      /<h1[^>]*class="entry-title"[^>]*>([^<]+)<\/h1>/,
      data
    );
    const result = {
      success: 'true',
      data: {
        title,
        thumbnail,
        ...info,
        Genres: genres,
        chapter: chapterDetails,
      },
    };

    return result;
  } catch (error) {
    console.log(error);

    console.log('Error:', error.message);
    return { success: false };
  }
};
// import axios from 'axios';

export const getChapter = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
        'Accept-Encoding': 'br,gzip',
        referer: 'https://komiktap.info/',
        'cache-control': 'max-age=600',
      },
    });

    // Mencari script yang berisi `ts_reader.run`
    const scriptMatch = data.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    if (scriptMatch) {
      for (const script of scriptMatch) {
        if (script.includes('ts_reader.run')) {
          // Ekstrak JSON dari `ts_reader.run({ ... })`
          const match = script.match(/ts_reader\.run\((\{.*?\})\);/s);
          if (match && match[1]) {
            const json = JSON.parse(match[1]);
            if (!json.sources || !json.sources[0].images) {
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
        }
      }
    }

    return {
      success: false,
    };
  } catch (error) {
    console.log(`Error : ${error.message}`);
    return {
      success: false,
    };
  }
};
