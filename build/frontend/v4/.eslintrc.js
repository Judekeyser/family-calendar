module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "no-param-reassign": "error",
        "block-scoped-var": "error",
        "guard-for-in": "error",
        "curly": "error",
        "max-len": ["error", { "code": 120 }],
        "semi": ["error", "always"]
    }
  }