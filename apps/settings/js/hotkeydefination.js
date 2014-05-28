/**
 * Created by TienNM on 5/16/14.
 */

var metaChar = false;
var exampleKey = 16;

function keyEvent(event) {
    var key = event.keyCode || event.which;
    var keychar = String.fromCharCode(key);

    if (key != exampleKey) {
        if (metaChar) {
            window.parent.alert("Combination of metaKey + " + keychar);
            metaChar = false;
        } else {
            window.parent.alert("You Changed Key : " + keychar);
        }
    }

    if(document.getElementById("key-home-check").checked){
        document.getElementById("key-home").innerHTML = keychar;
    }else
    if(document.getElementById("key-back-check").checked){
        document.getElementById("key-back").innerHTML = keychar;
    }else
    if(document.getElementById("key-menu-check").checked){
        document.getElementById("key-menu").innerHTML = keychar;
    }else
    if(document.getElementById("key-volume-down-check").checked){
        document.getElementById("key-volume-up").innerHTML = keychar;
    }else
    if(document.getElementById("key-volume-up-check").checked){
        document.getElementById("key-volume-down").innerHTML = keychar;
    }else
    if(document.getElementById("key-down-check").checked){
        document.getElementById("key-down").innerHTML = keychar;
    }else
    if(document.getElementById("key-up-check").checked){
        document.getElementById("key-up").innerHTML = keychar;
    }

}

document.getElementById("hotkey-setup").addEventListener("keydown",keyEvent,false);