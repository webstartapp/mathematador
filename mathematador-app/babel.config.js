module.exports = function (babelApi) {
  babelApi.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
