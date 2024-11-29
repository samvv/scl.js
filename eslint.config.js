// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'no-fallthrough': 'off',
      'no-constant-condition': ['error', { checkLoops: false }],
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['generatorFunctions', 'generatorMethods'] }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    }
  }
);
