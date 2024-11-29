import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';

import pkg from './package.json';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	define: {
		'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
		'import.meta.env.BUILD_DATE': JSON.stringify(new Date().toISOString())
	}
});
