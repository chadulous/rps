import { sveltekit } from '@sveltejs/kit/vite';
import socket from './plugin.js';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), socket.io]
};

export default config;
