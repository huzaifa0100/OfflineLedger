module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ⚠️ ORDER IS CRITICAL: decorators MUST come before class-properties
    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
  ],
};
