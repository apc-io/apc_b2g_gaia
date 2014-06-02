/**
 * Created by TienNM on 5/16/14.
 */

var metaChar = false;
var exampleKey = 16;

function keyEvent(event) {

    var charCode = event.keyCode || event.which;
    var keychar = String.fromCharCode(charCode);

    if (charCode == 0) keychar = ""+event.key;
    if (charCode == 8) keychar = "backspace"; //  backspace
    if (charCode == 9) keychar = "tab"; //  tab
    if (charCode == 13) keychar = "enter"; //  enter
    if (charCode == 16) keychar = "shift"; //  shift
    if (charCode == 17) keychar = "ctrl"; //  ctrl
    if (charCode == 18) keychar = "alt"; //  alt
    if (charCode == 19) keychar = "pause/break"; //  pause/break
    if (charCode == 20) keychar = "caps lock"; //  caps lock
    if (charCode == 27) keychar = "escape"; //  escape
    if (charCode == 33) keychar = "page up"; // page up,
    if (charCode == 34) keychar = "page down"; // page down
    if (charCode == 35) keychar = "end"; // end
    if (charCode == 36) keychar = "home"; // home
    if (charCode == 37) keychar = "left arrow"; // left arrow
    if (charCode == 38) keychar = "up arrow"; // up arrow
    if (charCode == 39) keychar = "right arrow"; // right arrow
    if (charCode == 40) keychar = "down arrow"; // down arrow
    if (charCode == 45) keychar = "insert"; // insert
    if (charCode == 46) keychar = "delete"; // delete
    if (charCode == 91) keychar = "left window"; // left window
    if (charCode == 92) keychar = "right window"; // right window
    if (charCode == 93) keychar = "select key"; // select key
    if (charCode == 96) keychar = "numpad 0"; // numpad 0
    if (charCode == 97) keychar = "numpad 1"; // numpad 1
    if (charCode == 98) keychar = "numpad 2"; // numpad 2
    if (charCode == 99) keychar = "numpad 3"; // numpad 3
    if (charCode == 100) keychar = "numpad 4"; // numpad 4
    if (charCode == 101) keychar = "numpad 5"; // numpad 5
    if (charCode == 102) keychar = "numpad 6"; // numpad 6
    if (charCode == 103) keychar = "numpad 7"; // numpad 7
    if (charCode == 104) keychar = "numpad 8"; // numpad 8
    if (charCode == 105) keychar = "numpad 9"; // numpad 9
    if (charCode == 106) keychar = "multiply"; // multiply
    if (charCode == 107) keychar = "add"; // add
    if (charCode == 109) keychar = "subtract"; // subtract
    if (charCode == 110) keychar = "decimal point"; // decimal point
    if (charCode == 111) keychar = "divide"; // divide
    if (charCode == 112) keychar = "F1"; // F1
    if (charCode == 113) keychar = "F2"; // F2
    if (charCode == 114) keychar = "F3"; // F3
    if (charCode == 115) keychar = "F4"; // F4
    if (charCode == 116) keychar = "F5"; // F5
    if (charCode == 117) keychar = "F6"; // F6
    if (charCode == 118) keychar = "F7"; // F7
    if (charCode == 119) keychar = "F8"; // F8
    if (charCode == 120) keychar = "F9"; // F9
    if (charCode == 121) keychar = "F10"; // F10
    if (charCode == 122) keychar = "F11"; // F11
    if (charCode == 123) keychar = "F12"; // F12
    if (charCode == 144) keychar = "num lock"; // num lock
    if (charCode == 145) keychar= "scroll lock"; // scroll lock
    if (charCode == 186) keychar = ";"; // semi-colon
    if (charCode == 187) keychar = "="; // equal-sign
    if (charCode == 188) keychar = ","; // comma
    if (charCode == 189) keychar = "-"; // dash
    if (charCode == 190) keychar = "."; // period
    if (charCode == 191) keychar = "/"; // forward slash
    if (charCode == 192) keychar = "`"; // grave accent
    if (charCode == 219) keychar = "["; // open bracket
    if (charCode == 220) keychar = "\\"; // back slash
    if (charCode == 221) keychar = "]"; // close bracket
    if (charCode == 222) keychar = "'"; // single quote

    if (charCode == exampleKey) {
        metaChar = true;
    }
    if (charCode != exampleKey) {
        if (metaChar) {
            window.parent.alert("Combination of metaKey + " + keychar);
            metaChar = false;
        } else {
            window.parent.alert("You changed key :  " + keychar);
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
        document.getElementById("key-volume-down").innerHTML = keychar;
    }else
    if(document.getElementById("key-volume-up-check").checked){
        document.getElementById("key-volume-up").innerHTML = keychar;
    }else
    if(document.getElementById("key-down-check").checked){
        document.getElementById("key-down").innerHTML = keychar;
    }else
    if(document.getElementById("key-up-check").checked){
        document.getElementById("key-up").innerHTML = keychar;
    }

}

document.getElementById("hotkey-setup").addEventListener("keydown",keyEvent,false);