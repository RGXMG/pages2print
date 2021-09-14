/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2020/12/27
 * Time: 14:09
 *
 */
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          browsers: '> 1%, IE 11, not dead',
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-syntax-class-properties',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    // Adds syntax support for optional chaining (?.)
    // detail see: https://blog.csdn.net/LeviDing/article/details/107551969
    '@babel/plugin-proposal-optional-chaining',
    // Adds syntax support for default value using ?? operator
    // detail see: https://blog.csdn.net/LeviDing/article/details/107502467
    '@babel/plugin-proposal-nullish-coalescing-operator',
    // Adds syntax support for ESModule namespace export
    '@babel/plugin-proposal-export-namespace-from',
  ],
};
