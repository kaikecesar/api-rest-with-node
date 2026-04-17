// Application
import { env } from './env/index.ts';
import { app } from './app.ts';

app.listen({ port: env.PORT }).then(() => console.log('HTTP server running!'));
