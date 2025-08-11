module.exports = {
  apps: [
    {
      name: 'backend-prod',
      script: './Backend/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    // {
    //   name: 'frontend-dev',
    //   script: 'npm',
    //   args: 'npm run dev',
    //   cwd: './Frontend',
    //   instances: 1,
    //   env: {
    //     NODE_ENV: 'development',
    //   },
    // },
    {
      name: 'frontend-prod',
      script: 'npx',
      args: 'serve -s dist -l 443',
      cwd: './Frontend',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
