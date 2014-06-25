
'use strict';

// handle HotKey settings
navigator.mozL10n.ready(function hotkeyDefination() {

    var _ = navigator.mozL10n.get;

    var gHotkeyManager = navigator.mozHotkeyManager;
    if (!gHotkeyManager) {
        return;
    }

    var isChangeKey = false;

    const TIMEOUT = 3000;

    var ul = document.getElementById('hotkey-setup').getElementsByTagName('li');
//Array save value key
    var valueKeyArr;

//position focus change key
    var position = -1;

    var errorElement = document.getElementById("hotkey-settings-error");

    var homeKeyCheckElement = document.querySelector('#key-home-check');
    var homeKeyElement = document.querySelector('#key-home');

    var muteKeyCheckElement = document.querySelector('#key-mute-check');
    var muteKeyElement = document.querySelector('#key-mute');

    var volumeUpKeyCheckElement = document.querySelector('#key-volume-up-check');
    var volumeUpKeyElement = document.querySelector('#key-volume-up');

    var volumeDownKeyCheckElement = document.querySelector('#key-volume-down-check');
    var volumeDownKeyElement = document.querySelector('#key-volume-down');

    var keyElementArr = [homeKeyElement, muteKeyElement, volumeUpKeyElement, volumeDownKeyElement];
    var checkElementArr = [homeKeyCheckElement, muteKeyCheckElement, volumeUpKeyCheckElement, volumeDownKeyCheckElement];

    function getL10NText(l10n_id, defaultText, placeHoders) {
        var text = "";
        if (placeHoders) {
            text = _(l10n_id, placeHoders);
        } else {
            text = _(l10n_id);
        }

        return text ? text : defaultText;
    };

    function getKeyChar(charCode, event) {
        var keyChar = "";
        var noKeyText = getL10NText("hotkey-noKey", "No key");
        if (charCode == -1) {
            keyChar = noKeyText;
            return keyChar;
        }

        if (charCode == 0) {
            if (event) {
                keyChar = "" + event.key;
            } else {
                keyChar = noKeyText;
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
            var defaultDisplayString = "Changing key to: " + keychar;
            var displayString = getL10NText("hotkey-changingMessage", { "key": keychar }, defaultDisplayString);
            var idx = -1;

            if (ul[0].className == "active") {
                homeKeyElement.textContent = displayString;
                homeKeyCheckElement.checked = false;
                valueKeyArr[0] = keychar;
                gHotkeyManager.setHomeKey(charCode);
            }
            else if (ul[1].className == "active") {
                muteKeyElement.textContent = displayString;
                muteKeyCheckElement.checked = false;
                valueKeyArr[1] = keychar;
                gHotkeyManager.setMuteKey(charCode);
            }
            else if (ul[2].className == "active") {
                volumeUpKeyElement.textContent = displayString;
                volumeUpKeyCheckElement.checked = false;
                valueKeyArr[2] = keychar;
                gHotkeyManager.setVolumeUpKey(charCode);
            }
            else if (ul[3].className == "active") {
                volumeDownKeyElement.textContent = displayString;
                volumeDownKeyCheckElement.checked = false;
                valueKeyArr[3] = keychar;
                gHotkeyManager.setVolumeDownKey(charCode);
            }

            // isChangeKey = false;
            // removeClassList();
            // gHotkeyManager.endEditHotkey();
        }
    }

    function clickKey(value) {

        if(!isChangeKey || ul[value].classList != 'active') {
            gHotkeyManager.beginEditHotkey();
            removeClassList();
            ul[value].classList.add("active");
            position = value;
            keyElementArr[value].textContent = getL10NText("hotkey-pressKey", "Press a key ...");
            changeKey();
        } else {
            isChangeKey = false;
            removeClassList();
            gHotkeyManager.endEditHotkey();
        }
    }

    function removeClassList() {
        if (position != -1 && valueKeyArr.length != 0) {
            keyElementArr[position].textContent = valueKeyArr[position].toString();
        }
        valueKeyArr = new Array();
        var numKeySettings = ul.length; // the last element is the error message
        for (var i = 0; i < numKeySettings; i++) {
            valueKeyArr.push(keyElementArr[i].textContent);
            ul[i].classList.remove("active");
            checkElementArr[i].checked = false;
        }
    }

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
        var type = event["type"];
        var data = type.split(":");
        if (data[1] == "0") {
            // ok
        } else {
            // error
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

    function init() {
        function doInit(element, charCode) {
            element.textContent = getKeyChar(charCode);
        }

        doInit(homeKeyElement, gHotkeyManager.homeKey);
        doInit(muteKeyElement, gHotkeyManager.muteKey);
        doInit(volumeUpKeyElement, gHotkeyManager.volumeUpKey);
        doInit(volumeDownKeyElement, gHotkeyManager.volumeDownKey);

        // event handling
        homeKeyCheckElement.onclick = function k_homekeyPress() {
            clickKey(0);
        };
        muteKeyCheckElement.onclick = function k_mutekeyPress() {
            clickKey(1);
        };
        volumeUpKeyCheckElement.onclick = function k_volumeupkeyPress() {
            clickKey(2);
        };
        volumeDownKeyCheckElement.onclick = function k_volumedownkeyPress() {
            clickKey(3);
        };

        gHotkeyManager.onHotkeySetResult = onHotkeySetResult;

        document.body.addEventListener("keydown", keyEvent, false);
    }

    init();

});
