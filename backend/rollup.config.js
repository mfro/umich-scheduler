module.exports = {
    input: 'src/main.js',
    output: {
        file: 'main.js',
        format: 'cjs',
        sourcemap: true,
    },
    external: [
        'path',
        'https',
        'readline',
        'perf_hooks',
        
        'express',
        'fs-extra',
    ],
};
