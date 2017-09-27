function createAssetTags(assetsURL) {
  const tags = {};
  if (assetsURL.js) tags.js = `<script src="${assetsURL.js}"></script>`;
  if (assetsURL.css) tags.css = `<link rel="stylesheet" href="${assetsURL.css}" type="text/css">`;
  return tags;
}

export function extractor(source) {
  var included = source.match(/\{include .*\}/g);
  var fileREG = /file\s?=\s?["'].*?["']/;
  var quotationREG = /["'].*?["']/;
  if(!included) return [];
  var res = [];
  included.forEach(function (element) {
    let includeFile = fileREG.exec(element)[0];
    let file = quotationREG.exec(includeFile)[0];
    res.push(file.slice(1,file.length-1));
  });
  return res;
}

export function injector(template, assetsURL) {
  const htmlRegExp = /(<html[^>]*>)/i;
  const headRegExp = /(<\/head\s*>)/i;
  const bodyRegExp = /(<\/body\s*>)/i;
  const assetTags = createAssetTags(assetsURL);
  let injected = template;

  if (assetTags.js) {
    if (bodyRegExp.test(injected)) {
      injected = injected.replace(bodyRegExp, match => assetTags.js + match);
    } else {
      injected += assetTags.css;
    }
  }

  if (assetTags.css) {
    if (!headRegExp.test(injected)) {
      if (htmlRegExp(injected)) {
        injected = injected.replace(htmlRegExp, match => match + '<head></head>');
      } else {
        injected = '<head></head>' + injected;
      }
    }
    injected = injected.replace(headRegExp, match => assetTags.css + match);
  }
  return injected;
}
