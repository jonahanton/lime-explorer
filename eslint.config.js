import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/**', 'dist/**', 'public/**', 'scripts/**'],
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        FileReader: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
      },
    },
    rules: {
      'prefer-const': 'warn',
      'no-console': ['error', { allow: ['error', 'info', 'warn'] }],
      'no-debugger': 'warn',
      'no-extra-semi': 'warn',
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
