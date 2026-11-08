// Keep server development settings in .env from changing the frontend build.
process.env.NODE_ENV = 'production';
const { build } = await import('vite');
await build();
