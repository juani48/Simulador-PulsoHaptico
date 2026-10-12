import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { getDistDirectory, serverConfig } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = createApp(getDistDirectory(__dirname));

app.listen(serverConfig.port, () => {
  console.log(`Pulso Háptico Bridge → http://localhost:${serverConfig.port}`);
});
