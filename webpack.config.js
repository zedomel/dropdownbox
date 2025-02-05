const path = require('path');

module.exports = {  
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'dropdownbox.js',    
    library: 'DropdownBox',
    libraryTarget: 'umd',
    globalObject: 'this'    
  },  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/, // Rule for CSS files
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};