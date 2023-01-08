module.exports = {
  './src/**/*.ts': 'eslint --ignore-path .gitignore',
  '*': ['editorconfig-checker', 'prettier --ignore-path .gitignore --ignore-unknown --check']
};
