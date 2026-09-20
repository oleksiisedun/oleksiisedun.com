import js from '@eslint/js';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  { ignores: ['node_modules/'] },
  js.configs.recommended,
  {
    // Modern-JS rules and the "every function needs typed JSDoc" rule from the global conventions.
    plugins: { jsdoc },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          contexts: ['VariableDeclarator > ArrowFunctionExpression'],
          checkConstructors: false,
        },
      ],
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-type': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-types': 'error',
    },
  },
  { files: ['js/**/*.js'], languageOptions: { sourceType: 'module', globals: globals.browser } },
  { files: ['sw.js'], languageOptions: { sourceType: 'script', globals: globals.serviceworker } },
  { files: ['worker/**/*.js'], languageOptions: { sourceType: 'module', globals: globals.serviceworker } },
  { files: ['scripts/**/*.mjs', 'eslint.config.js'], languageOptions: { sourceType: 'module', globals: globals.node } },
];
