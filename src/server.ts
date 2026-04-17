// Application
import { env } from './env/index.ts';
import { app } from './app.ts';

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => console.log('HTTP server running!'));
