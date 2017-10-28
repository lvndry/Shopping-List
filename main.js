const electron = require('electron');
const path = require('path');
const url = require('url');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let newwindow;

//Set ENV
process.env.NODE_ENV = 'production';

//Listen for the app to be ready
app.on('ready', function(){
  //Create a new window
  mainWindow = new BrowserWindow({});
  //Load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  //Insert Menu
  Menu.setApplicationMenu(mainMenu);

  //Handlde close app
  app.on('closed', function(){
    app.quit();
  })
});

//Handlde create Add window
function createAddWindow(){
  newwindow = new BrowserWindow({
    width: 300, height: 200, title: 'Add item in shopping list'
  });
  //Load html into window
  newwindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  //Garbage collection
  newwindow.on('close', function(){
    newwindow = null;
  })
  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  //Insert Menu
  Menu.setApplicationMenu(mainMenu);
}

//Catch item add
ipcMain.on('item:add', function(e, item){
  console.log(item);
  mainWindow.webContents.send('item:add', item);
  newwindow.close();
});

//Create menu template
let menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
      label: 'Add item',
      click(){
        createAddWindow();
      }
    },
    {
      label: 'Clear items',
      click(){
        mainWindow.webContents.send('item:clear');
      }
    },
    {
      label: 'Quit',
      accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
      click(){
        app.quit();
      }
    }
  ]
}
];

//If Mac add empty object to menu
if(process.platform == 'darwin'){
  menuTemplate.unshift({});
}

//Add dev tools if not in production
if(process.env.NODE_ENV !== 'production'){
  menuTemplate.push({
    label:'Dev tools',
    submenu: [{
        label: 'Toogle devtools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}
