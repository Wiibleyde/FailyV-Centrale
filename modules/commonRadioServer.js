//Récupération du module WebSocket
const WebSocket = require("ws");
//Connection au serveur de radio communes
const ws = new WebSocket(`ws://${process.env.RADIO_SERVER_URL}`);
//Récupération du module de création de JsonWebToken
const jwt = require('jsonwebtoken');

module.exports = {
    getWS: () => {
        return ws;
    },
    askRefresh: (radio) => {
        ws.send(jwt.sign({
            type: "ask_refresh",
            radioName: radio, //"lsms-lspd"
            by: "lsms"
        }, process.env.RADIO_SERVER_JWT_SECRET));
        ws.close();
    },
    askRadioInfo: (radio) => {
        ws.send(jwt.sign({
            type: "ask_radio_info",
            radioName: radio, //"lsms-lspd"
            by: "lsms"
        }, process.env.RADIO_SERVER_JWT_SECRET));
        ws.close();
    }
}