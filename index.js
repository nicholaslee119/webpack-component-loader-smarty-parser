const posthtml = require('posthtml');
const attrsPlugin = require('posthtml-extend-attrs');

function createAssetTags(assetsURL) {
  const tags = {};
  if (assetsURL.js) tags.js = `<script src="${assetsURL.js}"></script>`;
  if (assetsURL.css) tags.css = `<link rel="stylesheet" href="${assetsURL.css}" type="text/css">`;
  return tags;
}

exports.extractor = function(source) {
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

exports.injector = function (template, component, buildOption) {
  const htmlRegExp = /(<html[^>]*>)/i;
  const headRegExp = /(<\/head\s*>)/i;
  const bodyRegExp = /(<\/body\s*>)/i;

  const assetsURL = {};
  assetsURL.js = `${buildOption.publicPath}${component.name}.js`;
  assetsURL.css = `${buildOption.publicPath}${component.name}.css`

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

exports.addScopeAttr = function(template, component) {
  if (!component.scopedSelectors) return template;
  const attrsTree = {};
  component.scopedSelectors.forEach((scopedSelector) => {
    attrsTree[`.${scopedSelector}`] = {};
    attrsTree[`.${scopedSelector}`][`data-s-${component.scopeID}`] = '';
  });
  return new Promise((resolve) => {
    posthtml([attrsPlugin({
      attrsTree,
    })])
      .process(template)
      .then((result) => {
        resolve(result.html);
      });
  });
};