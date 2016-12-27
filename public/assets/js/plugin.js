function readBody(xhr) {
    var data;
    if (!xhr.responseType || xhr.responseType === "text") {
        data = xhr.responseText;
    } else if (xhr.responseType === "document") {
        data = xhr.responseXML;
    } else {
        data = xhr.response;
    }
    return data;
}

function test(){
    var socket = io.connect();
    var $messageForm = $('#message-form');
    var $message = $('#message');
    var $chat = $('#chat');
    var $userFormArea = $('#userFormArea');
    var $messageArea = $('#messageArea');
    var $userForm = $('#user-form');
    var $users = $('#users');
    var $username = $('#username');

    $messageForm.submit(function(e){
        e.preventDefault();
        socket.emit('send message', $message.val());
        $message.val('');
    })

    socket.on('new message', function(data){
        $chat.append('<div class="well"><strong>' + data.user + ':</strong> ' + data.msg + '</div>')
    })

    $userForm.submit(function(e){
        e.preventDefault();
        socket.emit('new user', $username.val(), function(data){
            if(data){
                $userFormArea.hide();
                $messageArea.show();
            }
        });
        $username.val('');
    })

    socket.on('get users', function(data){
        var html = '';
        for(i=0; i<data.length; i++){
            html += '<li class="list-group-item">' + data[i] + '</li>';
        }
        $users.html(html);
    })
}

