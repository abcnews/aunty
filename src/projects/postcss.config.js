module.exports = ({ options }) => ({
  plugins: {
    autoprefixer: {
      browsers: options.browsers
    }
  }
});
