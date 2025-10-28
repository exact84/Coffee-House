import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': ['error', { singleQuote: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
    },
  },
];
