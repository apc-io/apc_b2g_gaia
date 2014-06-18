/**
 * Created by TienNM on 5/16/14.
 */


'use strict';

var isChangeKey = false;

const TIMEOUT = 3000;

var ul;

//Array save value key
var valueKeyArr;

//array id text key
var valueActive =  ["key-home","key-mute","key-volume-up","key-volume-down"];

//array radio-button key
var valueCheck =  ["key-home-check","key-mute-check","key-volume-up-check","key-volume-down-check"];

//position focus change key
var position = -1;

var gHotkeyManager = navigator.mozHotkeyManager;
var homeKeyElement = document.getElementById("key-home");
var homeKeyCheckElement = document.getElementById("key-home-check");
var muteKeyElement = document.getElementById("key-mute");
var muteKeyCheckElement = document.getElementById("key-mute-check");
var volumeUpKeyElement = document.getElementById("key-volume-up");
var volumeUpKeyCheckElement = document.getElementById("key-volume-up-check");
var volumeDownKeyElement = document.getElementById("key-volume-down");
var volumeDownKeyCheckElement = document.getElementById("key-volume-down-check");
var errorElement = document.getElementById("hotkey-settings-error");

var keyElementArr = [homeKeyElement, muteKeyElement, volumeUpKeyElement, volumeDownKeyElement];
var checkElementArr = [homeKeyCheckElement, muteKeyCheckElement, volumeUpKeyCheckElement, volumeDownKeyCheckElement];

function init() {
    function doInit(element, charCode) {
        element.innerHTML = getKeyChar(charCode);
    }

    doInit(homeKeyElement, gHotkeyManager.homeKey);
    doInit(muteKeyElement, gHotkeyManager.muteKey);
    doInit(volumeUpKeyElement, gHotkeyManager.volumeUpKey);
    doInit(volumeDownKeyElement, gHotkeyManager.volumeDownKey);
}

init();

function getKeyChar(charCode, event) {
    var keyChar = "";
    dump("_________ this is getKeyChar and charCode is " + charCode);
    if (charCode == -1) {
        keyChar = "No key";
        return keyChar;
    }

    if (charCode == 0) {
        if (event) {
            keyChar = "" + event.key;
        } else {
            keyChar = "No key";
        }
        return keyChar;
    }

    for (var i = 0; i < HotKey['key'].length; i++) {
        if (charCode == HotKey['key'][i].keyCode) {
            keyChar = HotKey['key'][i].value;
            return keyChar;
        }
    }

    return String.fromCharCode(charCode);
}

function keyEvent(event) {

    if (isChangeKey) {

        var charCode = event.keyCode || event.which;
        var keychar = getKeyChar(charCode);
        var displayString = "Changing key to: " + keychar;
        var idx = -1;

        if (ul[0].className == "active") {
            homeKeyElement.innerHTML = displayString;
            homeKeyCheckElement.checked = false;
            valueKeyArr[0] = keychar;
            gHotkeyManager.setHomeKey(charCode);
        }
        else if (ul[1].className == "active") {
            muteKeyElement.innerHTML = displayString;
            muteKeyCheckElement.checked = false;
            valueKeyArr[1] = keychar;
            gHotkeyManager.setMuteKey(charCode);
        }
        else if (ul[2].className == "active") {
            volumeUpKeyElement.innerHTML = displayString;
            volumeUpKeyCheckElement.checked = false;
            valueKeyArr[2] = keychar;
            gHotkeyManager.setVolumeUpKey(charCode);
        }
        else if (ul[3].className == "active") {
            volumeDownKeyElement.innerHTML = displayString;
            volumeDownKeyCheckElement.checked = false;
            valueKeyArr[3] = keychar;
            gHotkeyManager.setVolumeDownKey(charCode);
        }

        // isChangeKey = false;
        // removeClassList();
        // gHotkeyManager.endEditHotkey();
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
        dump("-----------------We'll start editing hotkey! at " + value);
        gHotkeyManager.beginEditHotkey();
        removeClassList();
        ul[value].classList.add("active");
        position = value;
        // document.getElementById(valueActive[value]).innerHTML = "Press a key...";
        keyElementArr[value].innerHTML = "Press a key";
        changeKey();
    } else {
        isChangeKey = false;
        removeClassList();
        gHotkeyManager.endEditHotkey();
    }
}

function removeClassList() {
    if (position != -1 && valueKeyArr[position] != undefined) {
        // ul[position].getElementsByTagName('small')[0].innerHTML = valueKeyArr[position].toString();
        keyElementArr[position].innerHTML = valueKeyArr[position].toString();
    }
    valueKeyArr = new Array();
    var numKeySettings = ul.length; // the last element is the error message
    for (var i = 0; i < numKeySettings; i++) {
        // valueKeyArr.push(ul[i].getElementsByTagName('small')[0].innerHTML);
        valueKeyArr.push(keyElementArr.innerHTML);
        ul[i].classList.remove("active");
        checkElementArr[i].checked = false;
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

function showError() {
    errorElement.style.display = "block";
    setTimeout(hideError, TIMEOUT);
}

function hideError() {
    errorElement.style.display = "none";
}

function onHotkeySetResult(event) {
    dump("This is the handler for hotkeySetResult: " + event["type"]);

    var type = event["type"];
    var data = type.split(":");
    if (data[1] == "0") {
        dump("Set hotkey ok!");
    } else {
        dump("Set hotkey error!");
        // need to show some error!
        switch (position) {
        case 0:
            valueKeyArr[0] = getKeyChar(gHotkeyManager.homeKey);
            break;
        case 1:
            valueKeyArr[1] = getKeyChar(gHotkeyManager.muteKey);
            break;
        case 2:
            valueKeyArr[2] = getKeyChar(gHotkeyManager.volumeUpKey);
            break;
        case 3:
            valueKeyArr[3] = getKeyChar(gHotkeyManager.volumeDownKey);
            break;
        }

        showError();
    }
    isChangeKey = false;
    removeClassList();
    gHotkeyManager.endEditHotkey();
}

gHotkeyManager.onHotkeySetResult = onHotkeySetResult;

