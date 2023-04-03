const esbuild = require('esbuild')

esbuild.build({
    entryPoints: ['core/bin/index.js'],
    bundle: true,
    platform:'node',
    outfile: 'dist/coo-moat.js',
  }).catch(() => process.exit(1))