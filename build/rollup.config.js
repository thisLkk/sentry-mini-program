export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/index.umd.js',
      format: 'umd'
    },
    {
      file: 'lib/index.esm.js',
      format: 'esm'
    },
    {
      file: 'lib/index.iife.js',
      format: 'iife'
    },
  ]
};