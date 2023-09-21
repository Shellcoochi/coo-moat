const esbuild = require('esbuild')

esbuild.build({
    entryPoints: ['core/bin/index.js'],
    bundle: true,
    platform:'node',
    minify: true,
    outfile: 'dist/core/coo-moat.js',
  }).catch(() => process.exit(1))