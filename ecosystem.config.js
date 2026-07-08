module.exports = {
  apps: [
    {
      name: 'ctgpro-backend',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'ctgpro-frontend-preview',
      cwd: './frontend',
      script: 'npx',
      args: 'vite preview --host 0.0.0.0 --port 4173',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
