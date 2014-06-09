/**
 * Created by TienNM on 5/16/14.
 */


'use strict';

var isChangeKey = false;

const TIMEOUT = 2000;

var ul;

//Array save value key
var valueKeyArr;

//array id text key
var valueActive =  ["key-home","key-mute","key-volume-up","key-volume-down"];

//array radio-button key
var valueCheck =  ["key-home-check","key-mute-check","key-volume-up-check","key-volume-down-check"];

//position focus change key
var position = -1;

function keyEvent(event) {

    if (isChangeKey) {

        var charCode = event.keyCode || event.which;
        var keychar = String.fromCharCode(charCode);


        for (var i = 0; i < HotKey['key'].length; i++) {
            if (charCode == 0) {
                keychar = "" + event.key;
                break;
            }
            if (charCode == HotKey['key'][i].keyCode) {
                keychar = HotKey['key'][i].value;
                break;
            }
        }


        if (ul[0].className == "active") {
            document.getElementById("key-home").innerHTML = keychar;
            document.getElementById("key-home-check").checked = false;
            valueKeyArr[0] = keychar;
        }
        else if (ul[1].className == "active") {
            document.getElementById("key-mute").innerHTML = keychar;
            document.getElementById("key-mute-check").checked = false;
            valueKeyArr[1] = keychar
        }
        else if (ul[2].className == "active") {
            document.getElementById("key-volume-up").innerHTML = keychar;
            document.getElementById("key-volume-up-check").checked = false;
            valueKeyArr[2] = keychar
        }
        else if (ul[3].className == "active") {
            document.getElementById("key-volume-down").innerHTML = keychar;
            document.getElementById("key-volume-down-check").checked = false;
            valueKeyArr[3] = keychar
        }

        isChangeKey = false;
        removeClassList();
    }
}

document.body.addEventListener("keydown", keyEvent, false);

var clickHandler = {
    'key-home-check': function () {
        clickKey(0);
    },
    'key-mute-check': function () {
        clickKey(1);
    },
    'key-volume-up-check': function () {
        clickKey(2);
    },
    'key-volume-down-check': function () {
        clickKey(3);

    }
}

function clickKey(value) {

    if(!isChangeKey || ul[value].classList != 'active') {
        removeClassList();
        ul[value].classList.add("active");
        position = value;
        document.getElementById(valueActive[value]).innerHTML = "Input Hot key...";
        changeKey();
             }
        else{
        isChangeKey = false;
        removeClassList();
        }
}

function removeClassList() {
    if (position != -1 && valueKeyArr.length != 0)
        ul[position].getElementsByTagName('small')[0].innerHTML = valueKeyArr[position].toString();
    valueKeyArr = new Array();
    for (var i = 0; i < ul.length; i++) {
        valueKeyArr.push(ul[i].getElementsByTagName('small')[0].innerHTML);
        ul[i].classList.remove("active");
        document.getElementById(valueCheck[i]).checked = false;
    }
}

document.body.addEventListener('click', function (evt) {
    ul = document.getElementById('hotkey-setup').getElementsByTagName('li');
    if (clickHandler[evt.target.id])
        clickHandler[evt.target.id || evt.target.dataset.fb].call(this, evt);
});


function changeKey() {
    isChangeKey = true;
}

