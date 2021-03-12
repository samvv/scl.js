module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-this-alias': 'off',
    'no-fallthrough': 'off',
    'no-constant-condition': ['error', { checkLoops: false }],
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-empty-function': ['error', { allow: ['generatorFunctions', 'generatorMethods'] }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  parserOptions: {
    project: './tsconfig.json'
  }
}
