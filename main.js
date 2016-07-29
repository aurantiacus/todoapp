'use strict'

const electron = require('electron')
const { app } = electron
const { BrowserWindow } = electron
const { dialog } = electron

const { autoUpdater } = require('electron')
autoUpdater.setFeedURL('http://localhost:8080/')
autoUpdater.checkForUpdates()

autoUpdater.on('update-downloaded', () => {
  let index = dialog.showMessageBox({
    message: 'アップデートあり',
    detail: '再起動してインストールできます。',
    buttons: ['再起動', '後で']
  })
  if (index === 0) {
    autoUpdater.quitAndInstall()
  }
})
autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    message: 'アップデートはありません',
    buttons: ['OK']
  })
})
autoUpdater.on('error', () => {
  dialog.showMessageBox({
    message: 'アップデートエラーが起きました',
    buttons: ['OK']
  })
})

let mainWindow = null

console.dir(BrowserWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('ready', () => {
  if (handleSquirrelEvent()) return
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    webPreferences: { webSecurity: false },
    frame: false
  })
  mainWindow.loadURL(`file://${__dirname}/dist/index.html`)
  // mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => { mainWindow = null })
})

var handleSquirrelEvent = () => {
  if (process.argv.length === 1) {
    return false
  }

  const ChildProcess = require('child_process')
  const path = require('path')

  const appFolder = path.resolve(process.execPath, '..')
  const rootAtomFolder = path.resolve(appFolder, '..')
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))
  const exeName = path.basename(process.execPath)

  const spawn = (command, args) => {
    let spawnedProcess

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true})
    } catch (error) {}

    return spawnedProcess
  }

  const spawnUpdate = (args) => {
    return spawn(updateDotExe, args)
  }

  const squirrelEvent = process.argv[1]
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName])

      setTimeout(app.quit, 1000)
      return true

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName])

      setTimeout(app.quit, 1000)
      return true

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit()
      return true
  }
}
