const extVersion = chrome.runtime.getManifest().version;

const inject = async (branch, version) => {
  console.log('[GooseMod for Web] Injecting...');

  window.gmExtension = version;

  const branchURLs = {
    release: 'https://api.goosemod.com/inject.js',
    dev: 'https://updates.goosemod.com/guapi/goosemod/dev',
    local: 'http://localhost:1234/index.js'
  };

  console.log('[GooseMod for Web] Branch =', branch);
  console.log('[GooseMod for Web] JS Url =', branchURLs[branch]);
  
  const js = await (await fetch(branchURLs[branch])).text(); // JSON.parse(localStorage.getItem('goosemodCoreJSCache'));

  const el = document.createElement('script');
  
  el.appendChild(document.createTextNode(js));
  
  document.body.appendChild(el);

  console.log('[GooseMod for Web] Injected fetched JS');
};


// Extension Storage (v10)
let storageCache = {};

chrome.storage.local.get(null, (data) => {
  storageCache = data;


  const el = document.createElement('script');

  el.appendChild(document.createTextNode(`(${inject.toString()})(${JSON.stringify(storageCache['goosemodUntetheredBranch'] || 'release')}, ${JSON.stringify(extVersion)})`));

  document.body.appendChild(el);
});


document.addEventListener('gmes_get', ({ }) => {
  document.dispatchEvent(new CustomEvent('gmes_get_return', { detail: storageCache }));
});

document.addEventListener('gmes_set', ({ key, value }) => {
  storageCache[key] = value; // Repopulate cache with updated value
  
  const obj = {}; // Create object for set
  obj[key] = value;

  chrome.storage.local.set(obj);

  // chrome.runtime.sendMessage({ storage: { type: 'set', key, value } }); // Actually store change
});

document.addEventListener('gmes_remove', ({ key }) => {
  delete storageCache[key]; // Repopulate cache with updated value

  chrome.storage.local.remove(key);

  // chrome.runtime.sendMessage({ storage: { type: 'remove', key } }); // Actually store change
});