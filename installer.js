var electronInstaller = require('electron-winstaller')

var resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: '../todoapp-win32-x64',
  outputDirectory: '../todo-app-installer',
  authors: 'miz',
  exe: 'todoapp.exe',
  version: '0.0.2'
})

resultPromise.then(
  () => console.log('It worked!'),
  (e) => console.log(`No dice: ${e.message}`)
)
