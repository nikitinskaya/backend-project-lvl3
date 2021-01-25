const getResourceName = (urlObj, ext = '.html') => {
  const linkBody = `${urlObj.hostname}${urlObj.pathname}`;
  const slug = linkBody.replace(/[^\w]/gi, '-');
  return `${slug}${ext}`;
};

const pageLoader = (link) => {
  const urlObj = new URL(link);
  const name = getResourceName(urlObj);
  return name;
};

export default pageLoader;
