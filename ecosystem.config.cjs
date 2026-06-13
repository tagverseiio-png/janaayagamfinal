module.exports = {
  apps: [
    {
      name: "jana-frontend",
      script: "npm",
      args: "run dev:frontend",
      cwd: "/home/admin/janaayagamfinal",
      env: {
        NODE_ENV: "development"
      }
    },
    {
      name: "jana-backend",
      script: "npx",
      args: "tsx src/index.ts",
      cwd: "/home/admin/janaayagamfinal/backend",
      env: {
        NODE_ENV: "development",
        PORT: 5001
      }
    }
  ]
};
