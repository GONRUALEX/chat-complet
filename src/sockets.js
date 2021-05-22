const Chat = require('./models/chat');

//ahora les decimos que se queden escuchando cuando hay una nueva conexión, connection
module.exports = function(io){

let users = {};

io.on('connection', async socket =>{
    console.log("conexión realizada");

    let messages = await Chat.find().limit(8).sort({date:1});
    socket.emit('load msgs',messages);

    socket.on('send message',async (data,cb)=>{
        //para poder enviar a todos los conectados el mensaje
        //tendré que utilizar no socket, si no io ya que socket solo tiene
        //el enlace a 1 usuario mientras que io lo tiene a todos
        var msg = data.trim();
        if ( msg.substring(0,3)==='/w '){
            msg = msg.substring(3);
            const index = msg.indexOf(' ');
            if (index !== -1){
                var name = msg.substring(0,index);
                var msg = msg.substring(index + 1);
                if (name in users){
                    console.log("está dentro de users")
                    //para enviar un mensaje privado cogemos el valor del socket 
                    // del usuario al que queremos mandar un mensaje y le emitimos
                    // un evento whisper y le enviamos el mensaje y el nombre dle usuario
                    //que lo envía
                    users[name].emit('whisper',{
                        msg,
                        nick : socket.nickname
                    })
                    users[socket.nickname].emit('whisper',{
                        msg,
                        nick : socket.nickname
                    })
                }else{
                    cb('El usuario no existe!!  ');
                }
            }else{
                cb('No estás añadiendo un mensaje, recuerda que el nombre al que quieres mandar el mensaje privado debe ir con un espacio respecto el mensaje')
            }
        }else{
           var newMsg = Chat({
                msg: msg,
                nick: socket.nickname
            });
            await newMsg.save();
            io.sockets.emit('new message',{msg:data, nick:socket.nickname});
        }
    });

    //en este caso escuchamos el evento send nickname pero a la vez que nos 
    // enviará un dato nos enviará también una función de callback,
    // lo que haremos será comprobar si existe o no el usuario
    socket.on('send nickName',(data, cb)=>{
        //si el usuario existe me devolverá el indice, si no -1, por tanto si 
        // es -1 mandaremos en el callback un false;
        if (data in users){
            cb(false);
        }else{
             cb(true);
             //guardamos en la propia conexión la propiedad nickname
             //y cadda usuario tenfrá toda la información del socket 
             socket.nickname = data;
             users[socket.nickname] = socket;
             //enviamos los usuarios que tenemos a todos 
             updateNickName();
        }

    });

    //El usuario que se haya logeado hemos añadido el nickname en el socket
    //ahora al desconectarse preguntamos si socket tiene la propiedad nickname
    // para que si no la tuviera retornara sin más, si lo tiene lo quitamos del arreglo
    socket.on('disconnect', (data)=>{
        if (!socket.nickname) return;
        delete users[socket.nickname];
        //envío los nuevos nicknames
        updateNickName();
    });

    function updateNickName(){
        //con objects.keys mandara un arreglo de los usuarios 
        io.sockets.emit('nicknames', Object.keys(users));
    }
}); 

}