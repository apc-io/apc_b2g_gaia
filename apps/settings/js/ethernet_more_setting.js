'use strict';

// handle Ethernet settings
navigator.mozL10n.ready(function ethernetSettings() {
    var _ = navigator.mozL10n.get;


    var gEthernetManager = navigator.mozEthernetManager;


  var gEthernetInformationSmallLabelIpAddress = document.querySelector('#ethernet-ip-address-infor-small-label');

  var gEthernetInformationSmallLabelGateway = document.querySelector('#ethernet-gateway-infor-small-label');

  var gEthernetInformationSmallLabelNetmark = document.querySelector('#ethernet-netmark-infor-small-label');

  var gEthernetInformationSmallLabelDNS1 = document.querySelector('#ethernet-dns1-infor-small-label');

  var gEthernetInformationSmallLabelDNS2 = document.querySelector('#ethernet-dns2-infor-small-label');




    function setValue() {

        gEthernetInformationSmallLabelIpAddress = gEthernetManager.staticconfig.ip;

        gEthernetInformationSmallLabelGateway = gEthernetManager.staticconfig.gateway;

        gEthernetInformationSmallLabelNetmark = gEthernetManager.staticconfig.netmask;

        gEthernetInformationSmallLabelDNS1 = gEthernetManager.staticconfig.dns1;

        gEthernetInformationSmallLabelDNS2 = gEthernetManager.staticconfig.dns2;

    };

    Connectivity.ethernetConnectedChanged = function() {
        if (gEthernetManager.connected) {
            setValue();
        } else {
        }
    };


    document.addEventListener('visibilitychange', setValue);
});
