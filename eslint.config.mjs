// ESLint flat config: typescript-eslint (type-aware) + eslint-plugin-playwright, with
// eslint-config-prettier last so formatting is left entirely to Prettier.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/', 'docs/'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['eslint.config.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['tests/**/*.ts', 'src/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Waits must be web-first assertions or expect.poll, never fixed sleeps.
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-skipped-test': ['error', { allowConditional: true }],
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/require-top-level-describe': 'error',
      'playwright/valid-title': 'error',
      // Page objects carry the assertions for reusable flows; the custom names are listed here.
      'playwright/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expect*', '*.expect*'],
          assertFunctionPatterns: ['^expect', '^assert'],
        },
      ],
    },
  },
  prettier,
);
