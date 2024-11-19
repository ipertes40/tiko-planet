// 入口文件

const { app, BrowserWindow } = require('electron')
const path = require('node:path')

// 将index.html加载进一个新的BrowserWindow实例。
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'src/init/preload.js')
        }
    }
)

win.loadFile('src/pages/index.html')
}

// 打开窗口。 
// Electron 中，只有在 app 模块的 ready 事件被激发后才能创建浏览器窗口。 您可以通过使用 app.whenReady() API来监听此事件。
app.whenReady().then(() => {
    createWindow()
})

// 关闭所有窗口时退出应用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})