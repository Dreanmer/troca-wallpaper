const Models = require('./data/models.js');

class MobScreeny {

    constructor (config) {
        this.config = config;
        this.devices = {};
    }

    register (socket, data) {
        const slot = this._findEmptySlot();

        this.devices[slot.id] = {
            id: socket.id,
            socket: socket,
            model: data.model,
            resX: data.widthPixels,
            resY: data.heightPixels,
            denX: data.xdpi,
            denY: data.ydpi,
            posX: slot.x,
            posY: slot.y,
            coordinates: slot.x + ':' + slot.y
        };

        return this.devices[slot.id];
    }

    getConnectedDevices () {
        const devices = [];
        Object.keys(this.devices).forEach((key) => {
            const device = this.devices[key];
            if(device){
                devices.push(device);
            }
        });
        return devices;
    }

    disconnect(id) {
        let device;
        Object.keys(this.devices).forEach((key) => {
            device = this.devices[key];
            console.log(device, key);
            if(device.id == id) {
                this.devices[key] = null;
                return false;
            }
        });
    }

    getScreenSize() {
        const devices = this.getConnectedDevices();
        return this._calcMaxResolutions(devices);
    }

    _calcMaxResolutions (devices) {
        const rows = {};
        const cols = {};
        devices.forEach((device) => {
            if(!rows[device.posY]){
                rows[device.posY] = 0;
            }
            if(!cols[device.posX]){
                cols[device.posX] = 0;
            }
            rows[device.posY] += device.resX;
            cols[device.posX] += device.resY;
        });

        let maxRow = 0;
        Object.keys(rows).forEach((key) => {
            const row = rows[key];
            maxRow = row > maxRow ? row : maxRow;
        });

        let maxCol = 0;
        Object.keys(cols).forEach((key) => {
            const col = cols[key];
            maxCol = col > maxCol ? col : maxCol;
        });

        return {
            x: maxRow,
            y: maxCol
        }
    }

    _findEmptySlot () {
        const maxX = this.config.size.x;
        const maxY = this.config.size.y;

        for(let x=0;x<maxX;x++){
            for(let y=0;y<maxY;y++) {
                const id = String(x)+String(y);
                if(!this.devices[id]) {
                    return {
                        id,
                        x,
                        y
                    };
                }
            }
        }

        console.log('its full, budy!');
        return false;
    }
}

module.exports = MobScreeny;