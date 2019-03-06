module.exports = {
  'env': {
    'es6': true,
    'node': true
  },
  'parserOptions': {
    'ecmaVersion': 2018
  },
  'extends': 'eslint:recommended',
  'rules': {
    'indent': [
      'error',
      2,
      {'SwitchCase': 1}
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'no-unused-vars': [
      'warn'
    ],
    'no-inner-declarations': [
      'off'
    ]
  }
};