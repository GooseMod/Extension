const cspAllowAll = [
  'connect-src',
  'style-src',
  'img-src',
  'font-src'
];

chrome.webRequest.onHeadersReceived.addListener(({ responseHeaders, url }) => {
  let csp = responseHeaders.find((x) => x.name === 'content-security-policy');

  if (csp) {
    for (let p of cspAllowAll) {
      csp.value = csp.value.replace(`${p}`, `${p} * blob: data:`); // * does not include data: URIs
    }

    // Fix Discord's broken CSP which disallows unsafe-inline due to having a nonce (which they don't even use?)
    csp.value = csp.value.replace(/'nonce-.*?' /, '');
  }

	return {
    responseHeaders
  };
},

  {
    urls: [
      '*://*.discord.com/*'
    ]
  },

  ['blocking', 'responseHeaders']
);


// Extension Storage (v10)
const storageCache = {}; // Based off storage cache object

chrome.storage.local.get(null, (data) => {
  storageCache = data;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.storage) { // Storage obj
    const { type, key, value } = request.storage;

    switch (type) {
      case 'set': {
        const obj = {}; // Make object for set
        obj[key] = value;

        chrome.storage.local.set(obj); // Set real storage
        storageCache[key] = value; // Set cache (mostly unneeded but)

        break;
      }

      case 'get': {
        sendResponse(storageCache);

        break;
      }

      case 'remove': {
        chrome.storage.local.remove(key);

        break;
      }
    }
  }
});