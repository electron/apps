const {app,BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 768,
    frame: false,
    title:'Timetable',
    resize:false
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // win.webContents.openDevTools();

  win.on('close', () => {
    win = null;
  });

  win.maximize();
  win.hide();
}

app.on('ready', function(){
  createWindow();
  win.webContents.on('did-finish-load',()=>{
    win.show();
  });
});

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') {
    app.quit();
  }
});
