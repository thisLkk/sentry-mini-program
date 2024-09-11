import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs' // 处理 common 模块js
import dts from 'rollup-plugin-dts';
export default {
  input: 'src/main.ts',
  output: [
    // {
    //   file: 'lib/umd/index.js',
    //   format: 'umd',
    //   entryFileNames: '[name].cjs.js',
    //   name: 'sentryMiniProgram',
    //   plugins: [],
    //   sourcemap: true, // 是否输出sourcemap
    // },
    {
      file: 'lib/index.js',
      format: 'umd',
      plugins: [],
      name: 'sentryMiniProgram',
      sourcemap: true, // 是否输出sourcemap
    },
    // {
    //   file: 'lib/iife/index.js',
    //   format: 'iife',
    //   name: 'sentryMiniProgram',
		// 	plugins: [terser()],
    //   sourcemap: true, // 是否输出sourcemap
    // },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    resolve(),
  ]
};