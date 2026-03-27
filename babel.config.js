module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
      },
    ],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    // Allows Jest to run Vite-style `import.meta.env.*` references.
    'babel-plugin-transform-vite-meta-env',
  ],
};

