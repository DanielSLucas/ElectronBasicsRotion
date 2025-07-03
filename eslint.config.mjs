import config from '@rocketseat/eslint-config/react.mjs'

export default [
  ...config,
  {
    rules: {
      "@stylistic/max-len": false
    }
  }
]
