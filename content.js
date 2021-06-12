const branchURLs = {
  'release': 'https://goosemod-api.netlify.app/inject.js',
  'dev': `https://raw.githubusercontent.com/GooseMod/GooseMod/master/dist/index.js?_=${Date.now()}`
};

const branch = localStorage.getItem('goosemodUntetheredBranch') || 'release';


let jsCache = JSON.parse(localStorage.getItem('goosemodCoreJSCache'));

const updateCache = async () => {
  jsCache = {};

  jsCache.js = await (await fetch(branchURLs[branch])).text();
  jsCache.hash = jsCache.js.match(/hash:"(.*?)"/);

  localStorage.setItem('goosemodCoreJSCache', JSON.stringify(jsCache));
};

(async function() {
  if (!jsCache) await updateCache();

  const el = document.createElement('script')

  el.appendChild(document.createTextNode(jsCache.js))

  document.body.appendChild(el);

  updateCache();
})();