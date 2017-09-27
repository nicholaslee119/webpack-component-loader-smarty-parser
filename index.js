
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
  const assetTags = {};
  if(assetsURL.js) assetTags.js = `<script src="${assetsURL.js}"/>`;
  if(assetsURL.css) assetTags.css = `<link rel="stylesheet" href="${assetsURL.css}" type="text/css">`;
  const inserted = template
  .replace('{* javaScript insertion *}', assetTags.js ? assetTags.js : '')
  .replace('{* css insertion *}', assetTags.css ? assetTags.css : '');
  return inserted;
}