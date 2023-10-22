import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { copy } from '@web/rollup-plugin-copy';

export default {
  input: 'index.html',
  output: { dir: 'dist' },
  plugins: [html(), nodeResolve(), copy({ patterns: 'fonts' }), terser()],
};
