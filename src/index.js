import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import cheerio from 'cheerio';

const getResourceName = (link, postfix = '.html') => {
  const { dir, name, ext } = path.parse(link);
  const linkBody = path.join(dir, name);
  const slug = linkBody.replace(/[^\w]/gi, '-');
  const format = ext || postfix;
  return `${slug}${format}`;
};

const download = (link) => axios.get(link, { responseType: 'arraybuffer' })
  .then(({ data }) => data);

const processAssets = (data, assetspath, link) => {
  const $ = cheerio.load(data);
  const tags = {
    img: 'src',
    link: 'href',
    script: 'src',
  };
  const assetsLinks = Object.entries(tags).flatMap(([tag, attr]) => $(`${tag}[${attr}]`)
    .toArray()
    .filter((el) => {
      const url = new URL($(el).attr(attr), link);
      return link === url.origin;
    })
    .map((el) => {
      const elPath = $(el).attr(attr);
      const url = new URL(elPath, link);
      const fileLink = `${url.hostname}${url.pathname}`;
      const relativePath = path.join(assetspath, getResourceName(fileLink, path.parse(elPath).ext));
      $(el).attr(attr, relativePath);
      return {
        relativePath,
        link: url.toString(),
      };
    }));

  const page = $.html();
  return { page, assetsLinks };
};

const pageLoader = (link, outputDir) => {
  const fileLink = new URL(link);
  const { origin } = fileLink;
  const fileLinkWithoutProto = `${fileLink.hostname}${fileLink.pathname}`;
  const filename = getResourceName(fileLinkWithoutProto);
  const assetsDir = getResourceName(fileLinkWithoutProto, '_files');
  const filepath = path.join(outputDir, filename);
  const assetspath = path.join(outputDir, assetsDir);

  return download(link)
    .then((data) => fs.mkdir(assetspath).then(() => data))
    .then((data) => processAssets(data, assetsDir, origin))
    .then(({ page, assetsLinks }) => fs.writeFile(filepath, page, { encoding: 'utf-8' })
      .then(() => assetsLinks))
    .then((assetsLinks) => {
      const promises = assetsLinks
        .map(({ relativePath, link: assetLink }) => download(assetLink)
          .then((data) => fs.writeFile(path.join(outputDir, relativePath), data)));
      return Promise.all(promises);
    })
    .then(() => filename);
};

export default pageLoader;
