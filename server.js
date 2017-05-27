const App = require('express')();
const Server = require('http').Server(App);
const Io = require('socket.io')(Server);
const Config = require('./config.js');
const MobScreeny = require('./modules/mobscreeny.js');
const Screeny = new MobScreeny(Config);

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
            denX: device.denX,
            denY: device.denY,
            coordinates: device.coordinates
        });
    });

    return res.send({
        'screenSize': Screeny.getScreenSize(),
        'devices': devices
    });
});

App.get('/emitSlices', (req, res) => {
    Screeny.emitSlices();
    return res.send('ok');
});

App.get('/models', (req, res) => {
    return res.send(Models);
});

Io.on('connection', (socket) => {
    const id = socket.id;
    console.log(id + ' connected');

    socket.on('register', (data) => {
        const device = Screeny.register(socket, data);
        if (!device) {
            return false;
        }

        // show positions for each connected device
        Screeny.getConnectedDevices().forEach((device) => {
            console.log('emmit: show_position - ' + device.coordinates);
            device.socket.emit('show_position', device.coordinates);
        });
    });

    socket.on('disconnect', () => {
        Screeny.disconnect(id);
        console.log(id + ' disconnected');
    });
});