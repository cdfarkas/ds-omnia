import { cpSync } from 'node:fs';

cpSync('src/fonts', 'dist/fonts', { recursive: true });
cpSync('src/fonts.css', 'dist/fonts.css');
