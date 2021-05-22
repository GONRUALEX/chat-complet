
//Vamos a utilizar el módulo http para crear un servidor a través de su método
//create server
const http = require('http');
const express = require('express');
const path = require('path');

const mongoose = require('mongoose');


const app = express();

//creamos el servidor mandándole el app a http ( en vez de crearlo y escucharlo directamente
// con express), esto me devuelve un servidor que lo 
//almaceno en una constante, con esto tenemos un servidor que le podemos dar a socket.io
// para que funcione
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

mongoose.connect('mongodb+srv://alex:mZcvPnvbdAUHfiCb@cluster0.0rlkz.mongodb.net/chat?retryWrites=true&w=majority')
.then(db=>console.log('db is conected'))
.catch(err=>console.log('problemas al conectar a la bd ',err));

//llamo al modulo exportado de io donde está la escucha y el código del soet
//como en el módulo exportado lo que exporto es una función 
// le pongo () con el parámetro io
require('./sockets')(io);

/*Inicialización del servidor que daremos a socketio*/
//settings
//Añadimos el puerto
app.set('port', process.env.PORT || 3000);
//aquí estamos metiendo la carpeta public para que se muestre en el servidor, siempre busca un archivo index, utilizamos el path.join
//para que no haya conflicto a la hora de representar /public o \public, con join pondrá el slash correcto
//los archivos estáticos son los archivos que no cambian
app.use(express.static(path.join(__dirname,'public')));

// En vez de app utilizamos server de http para levantar el servidor y estar escuchando
server.listen(app.get('port'),()=>{
    console.log("Server on port ", app .get('port'));
});




