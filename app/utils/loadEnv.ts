import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log(
  "%c Line:8 🌭 path.resolve(__dirname, '.env')",
  'color:#ed9ec7',
  path.resolve(__dirname, '.env')
);
