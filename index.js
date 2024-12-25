import { getChapter, getKomikDetail } from './src/komiktapHandler.js';

const names = ['secret-class', 'boarding-diary', 'sex-stopwatch'];
for (const name of names) {
  const data = await getKomikDetail(name);
  const image = await getChapter(data.data.chapter[0]);
  console.log(image);
}
