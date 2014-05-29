/**
 * Created by Manh Tien on 5/13/14.
 */


'use strict';
var downloadDialog = null;

function checkfotNetwork(){

    var online = (navigator && 'onLine' in navigator) ? navigator.onLine : true;
//    if(online === true){
//        window.parent.alert("You're online!!");
//    }
//    else
//    {
//        window.parent.alert("You need connect Internet!!");
//    }

    downloadDialog = document.getElementById('updates-download-dialog');
    downloadDialog.style.display = "block";

}

function configUpdate(){
    var configForm = document.getElementById("config-update-form");
    if(configForm.style.display == "none"){
        configForm.style.display = "block"
    }
    else
        configForm.style.display = "none";
}

//function changeTextURL(){
//    if(document.getElementById("update-url").textContent.length > 0){
//        downloadDialog = document.getElementById('updates-download-dialog').disabled = false;
//    }
//    else
//    {
//        downloadDialog = document.getElementById('updates-download-dialog').disabled = true;
//    }
//}

var clickHandler = {
    'check-for-update': function () {
        checkfotNetwork();
    },
    'updates-later-button': function () {
        downloadDialog = document.getElementById('updates-download-dialog');
        downloadDialog.style.display = "none";
    },
    'updates-download-button': function () {
        checkfotNetwork();
    },
    'config-for-update': function () {
        configUpdate();
    }
}

document.body.addEventListener('click',function(evt){
    if(clickHandler[evt.target.id])
        clickHandler[evt.target.id || evt.target.dataset.fb].call(this,evt);
});

//document.getElementById("update-url").addEventListener("change",changeTextURL,false);