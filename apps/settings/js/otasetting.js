/**
 * Created by Manh Tien on 5/13/14.
 */


'use strict';


var network = window.navigator.onLine;



function checkfotNetwork(){

    if(navigator.onLine){
        window.parent.alert("You're online!!");
    }
    else
    {
        window.parent.alert("You need connect Internet!!");
    }
}

var clickHandler = {
    'check-for-update': function () {
        checkfotNetwork();
    }

    window.addEventListener("offline", function(e) {do something})
}

document.body.addEventListener('click',function(evt){
    if(clickHandler[evt.target.id])
        clickHandler[evt.target.id || evt.target.dataset.fb].call(this,evt);
});