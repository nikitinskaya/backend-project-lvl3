import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

const getResourceName = (urlObj, ext = '.html') => {
  const linkBody = `${urlObj.hostname}${urlObj.pathname}`;
  const slug = linkBody.replace(/[^\w]/gi, '-');
  return `${slug}${ext}`;
};

const download = (link) => axios.get(link, { responseType: 'arraybuffer' })
  .then(({ data }) => data.toString());

const writeFile = (filepath, content) => fs
  .writeFile(filepath, content, { encoding: 'utf-8' });

const pageLoader = (link, outputDir) => {
  const urlObj = new URL(link);
  const filename = getResourceName(urlObj);
  const filepath = path.join(outputDir, filename);
  return download(link)
    .then((data) => writeFile(filepath, data))
    .then(() => filename);
};

export default pageLoader;
