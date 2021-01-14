import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

module.exports = {
    input: 'src/main.js',
    output: {
        file: 'main.js',
        format: 'cjs',
    },
    plugins: [
        json(),
        nodeResolve(),
        commonjs(),
    ],
    external: [
        'path',
        'https',
        'readline',
        'perf_hooks',
    ],
};

// module.exports = {
//   input: 'src/main.ts',
//   output: {
//     file: 'main.js',
//     format: 'cjs',
//   },
//   context: 'this',
//   plugins: [
//     json(),
//     typescript(),
//     nodeResolve(),
//     commonjs({
//       ignore: ['bufferutil', 'utf-8-validate'],
//     }),
//   ],
//   external: [
//     'url',
//   ],
// };
