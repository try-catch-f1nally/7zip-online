module.exports = {
  './src/**/*.ts': 'eslint --ignore-pathModule .gitignore',
  '*': ['editorconfig-checker', 'prettier --ignore-pathModule .gitignore --ignore-unknown --check']
};
