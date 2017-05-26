const App = require('express')();
const Server = require('http').Server(App);
const Io = require('socket.io')(Server);
const Config = require('./config.js');
const MobScreeny = require('./modules/mobscreeny.js');
const Screeny = new MobScreeny(Config);
const Fs = require('fs');

Server.listen(8080);

App.get('/', (req, res) => {
    return res.send('working');
});

App.get('/setGrid', (req, res) => {
    Config.size.x = req.query.sizeX;
    Config.size.y = req.query.sizeY;
    return res.send(Config);
});

App.get('/status', (req, res) => {
    const devices = [];
    Screeny.getConnectedDevices().forEach((device) => {
        devices.push({
            resX: device.resX,
            resY: device.resY,
            posX: device.posX,
            posY: device.posY,
            coordinates: device.coordinates
        });
    });

    return res.send({
        'screenSize': Screeny.getScreenSize(),
        'devices': devices
    });
});

App.get('/models', (req, res) => {
    return res.send(Models);
});

Io.on('connection', (socket) => {
    const id = socket.id;
    console.log(id + ' connected');

    socket.on('register', (data) => {
        let device = Screeny.register(socket, data);
        console.log(data, device.coordinates);

        // show positions for each connected device
        Screeny.getConnectedDevices().forEach((device) => {
            console.log('emmit: show_position - ' + device.coordinates);
            device.socket.emit('show_position', device.coordinates);
        });

        // emit test img
        Fs.readFile('./modules/data/test.bmp', function (err, data) {
            if (err) throw err;
            console.log('emmit: image_ready - ' + device.coordinates);
            console.log(data);
            socket.emit('image_ready', data);
        });
    });

    socket.on('disconnect', () => {
        Screeny.disconnect(id);
        console.log(id + ' disconnected');
    });
});