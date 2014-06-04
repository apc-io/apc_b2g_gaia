/**
 * Created by TienNM on 5/16/14.
 */


var downloadDialog = null;

var isShowDialog = false;

const TIMEOUT = 2000;

function keyEvent(event) {

    if(isShowDialog)
  {

    var charCode = event.keyCode || event.which;
    var keychar = String.fromCharCode(charCode);



        for(var i = 0 ; i <  HotKey['key'].length; i++){
            if (charCode == 0) {
                keychar = ""+event.key;
                break;
            }
            if(charCode == HotKey['key'][i].keyCode) {
                keychar = HotKey['key'][i].value;
                break;
            }
        }

     document.getElementById('key-chosse').innerHTML = "Changed Key : "+ keychar;



    if(document.getElementById("key-home-check").checked){
        document.getElementById("key-home").innerHTML = keychar;
        document.getElementById("key-home-check").checked = false;
    }else
    if(document.getElementById("key-mute-check").checked){
        document.getElementById("key-mute").innerHTML = keychar;
	document.getElementById("key-mute-check").checked = false;
    }else
    if(document.getElementById("key-volume-down-check").checked){
        document.getElementById("key-volume-down").innerHTML = keychar;
	document.getElementById("key-volume-down-check").checked = false;
    }else
    if(document.getElementById("key-volume-up-check").checked){
        document.getElementById("key-volume-up").innerHTML = keychar;
	document.getElementById("key-volume-up-check").checked = false;
    }


   //wait to 2 seconds;
    setTimeout(function() {
        downloadDialog = document.getElementById('div-dialog');
        downloadDialog.style.display = "none";
        isShowDialog = false;
    }, TIMEOUT);
}
}



document.body.addEventListener("keydown",keyEvent,false);

var clickHandler = {
    'key-home-check': function () {
        downloadDialog = document.getElementById('div-dialog');
        downloadDialog.style.display = "block";
	    document.getElementById('key-chosse').innerHTML = "";
        document.getElementById('text-dialog').innerHTML = "Type key from input keyboard : Home Key ";
        isShowDialog = true;
    },
    'key-mute-check': function () {
        downloadDialog = document.getElementById('div-dialog');
        downloadDialog.style.display = "block";
	document.getElementById('key-chosse').innerHTML = "";
        document.getElementById('text-dialog').innerHTML = "Type key from input keyboard : Mute Key ";
	isShowDialog = true;
    },
    'key-volume-up-check': function () {
        downloadDialog = document.getElementById('div-dialog');
        downloadDialog.style.display = "block";
	document.getElementById('key-chosse').innerHTML = "";
        document.getElementById('text-dialog').innerHTML = "Type key from input keyboard : Volume Up Key ";
	isShowDialog = true;
    },
    'key-volume-down-check': function () {
        downloadDialog = document.getElementById('div-dialog');
        downloadDialog.style.display = "block";
	document.getElementById('key-chosse').innerHTML = "";
        document.getElementById('text-dialog').innerHTML = "Type key from input keyboard : Volume Down Key ";
	isShowDialog = true;
    }
}

    document.body.addEventListener('click',function(evt){
    if(clickHandler[evt.target.id])
        clickHandler[evt.target.id || evt.target.dataset.fb].call(this,evt);
});
