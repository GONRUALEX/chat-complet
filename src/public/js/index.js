//pongo en una variable soket el io para poder manejarlo utilizo jquery
$(function(){
   const socket = io();

// obtengo los elementos del dom desde la interfaz del chat
const $messageForm = $('#message-form');
const $messageBox = $('#message');
const $chat = $('#chat');

//obtenemos el nick name del form de entrada de usuario
const $nickForm = $('#nickForm');
const $nickError = $('#nickError');
const $nickName = $('#nickname');
const $tiping = $('#tiping');
var usersTiping = [];

const $users = $('#usernames');
//en el caso del nickname de un nuevo usuario utilizamos una funcion de callback
//que nos dirá si es correcto o no recibiendo los datos de respuesta cuando mandamos 
//el nickname
$nickForm.submit((e)=>{
    e.preventDefault();
    socket.emit('send nickName', $nickName.val(), (data)=>{
        if (data){
            $('#nickWrap').hide();
            $('#contentWrap').show();
            $("#chat").animate({ scrollTop: $('#chat')[0].scrollHeight}, 1000);
        }else{
            $nickError.html(`<div class="alert alert-danger">El usuario ya existe</div>`);
        }
        $nickName.val('');
    });

});

$messageBox.on('keyup',(data)=>{
    setTimeout(()=>{
        if ($messageBox.val()===""){
            socket.emit('noTyping',data);
        }else{
            socket.emit('typing',data);
        }
    },100);
});

//capturo los eventos
//cuando se ejecute submit del formulario se ejecutará la función
$messageForm.submit((e)=>{
    //prevenimos el comportamiento por defecto de actualizar la pagina
    e.preventDefault();
    socket.emit('send message', $messageBox.val(), (e)=>{
        $chat.append(`<p class="error">${e}<p>`)
    });
    socket.emit('noTyping',"true");
    $messageBox.val('');
});

socket.on('new message', (data)=>{
    $chat.append("<i class='fas fa-user mr-5'></i><strong><i>" + data.nick + "</i></strong> : "+data.msg+ '<br/>');
    $("#chat").animate({ scrollTop: $('#chat').prop("scrollHeight")}, 500);
});

socket.on('nicknames', (data)=>{
    $users.empty();
    $.each(data,(index, user)=>{
        $users.append("<p><i class='fas fa-user mr-5'></i><strong><i>"+user+"</i></strong></p>");
     });
});

socket.on('whisper',(data)=>{
    $chat.append(`<p class="whisper">(private) <b>${data.nick} : <b>${data.msg}</p>`)
});

socket.on('load msgs',(data)=>{
    $.each(data,(key,msg)=>{
        displayMsg(msg);
    });
});

socket.on('tipeando',(data)=>{
    if (!usersTiping.includes(data)){
        usersTiping.push(data);
        let userstipinghtml='';
        $.each(usersTiping, (key,val)=>{
            userstipinghtml += `${val} está escribiendo ... `
        })
        $tiping.html(userstipinghtml);
    }
});

socket.on('noTipeando',(data)=>{
    if (usersTiping.includes(data)){
        usersTiping.splice(usersTiping.indexOf(data),1);
        let userstipinghtml='';
        $.each(usersTiping, (key,val)=>{
            userstipinghtml += `${val} está escribiendo ... `
        })
        $tiping.html(userstipinghtml);
    }
});



function displayMsg(data){
    $chat.append(`<i class='fas fa-user mr-5'></i><i>${data.nick}</i>: ${data.msg}<br/>`)
}
})
