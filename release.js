var packager = require('electron-packager')
var config = require('./package.json')

packager({
  dir: './',
  out: '../',
  name: config.name,
  platform: 'win32',
  arch: 'x64',
  version: '1.2.2',
  // icon: '',
  overwrite: true,
  asar: true,
  ignore: 'node_modules|src|.gitignore|installer.js|release.js|webpack.config.js'
}, function done (err, appPath) {
  if (err) {
    throw new Error(err)
  }
  console.log('Done!')
})
