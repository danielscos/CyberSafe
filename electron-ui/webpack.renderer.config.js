const rules = require('./webpack.rules');

// 1. Add Babel loader for .js and .jsx
rules.push({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react'
      ]
    }
  }
});

// 2. Keep your existing CSS rule
rules.push({
  test: /\.css$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' }
  ]
});

module.exports = {
  // 3. Resolve both .js and .jsx so imports work without extensions
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules
  }
};
