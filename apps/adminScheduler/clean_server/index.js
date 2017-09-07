const express = require('./resources/app/servertest3.js'); //
const electron = require('electron')
var win;

const {app,BrowserWindow} = electron
app.on('ready', () => {

  win = new BrowserWindow({width:1035, height:825})
// let win = new BrowserWindow({width:1035, height:825})
  //win.loadURL(`file://${__dirname}/index.html`)
  win.loadURL('http://localhost:3000/display4');
  win.focus();
});
