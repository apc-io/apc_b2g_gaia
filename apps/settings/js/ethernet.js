'use strict';

// handle Ethernet settings
navigator.mozL10n.ready(function ethernetSettings() {
  var _ = navigator.mozL10n.get;
  
  var settings = window.navigator.mozSettings;
  if (!settings)
    return;

  var gEthernetManager = navigator.mozEthernetManager;

  var gEthernet = document.querySelector('#ethernet');
  var gEthernetCheckBox = document.querySelector('#ethernet-enabled input');
  var gEthernetInfoBlock = document.querySelector('#ethernet-desc');
  var gEthernetDynamic = document.querySelector('#ethernet-dynamic');
  var gEthernetDynamicCheckBox = document.querySelector('#ethernet-dynamic input');
//  var gEthernetManual = document.querySelector('#ethernet-manual');
//  var gEthernetManualCheckBox = document.querySelector('#ethernet-manual input');
  
  var gEthernetIpAddress = document.querySelector('#ethernet-ip-address');
  var gEthernetSmallLabelIpAddress = document.querySelector('#ethernet-ip-address-small-label');
  
  var gEthernetGateway = document.querySelector('#ethernet-gateway');
  var gEthernetSmallLabelGateway = document.querySelector('#ethernet-gateway-small-label');
  
  var gEthernetNetmark = document.querySelector('#ethernet-netmark');
  var gEthernetSmallLabelNetmark = document.querySelector('#ethernet-netmark-small-label');
  
  var gEthernetDNS1 = document.querySelector('#ethernet-dns1');
  var gEthernetSmallLabelDNS1 = document.querySelector('#ethernet-dns1-small-label');
  
  var gEthernetDNS2 = document.querySelector('#ethernet-dns2');
  var gEthernetSmallLabelDNS2 = document.querySelector('#ethernet-dns2-small-label');

 var gEthernetShowInfor = document.querySelector('#button-show-infor');
  
  var gIsEthernetDynamic = true;
  var gEthernetIpAddressValue = "192.168.0.13";
  var gEthernetGatewayValue = "22.11.2.2";
  var gEthernetNetmarkValue = "33.34.3";
  var gEthernetDNS1Value = "545";
  var gEthernetDNS2Value = "3543";

  //Currently, only DHCP is supported
  gEthernetDynamicCheckBox.disabled = false;
//  gEthernetManualCheckBox.disabled = true;
  
  //manual settings elements

//  var gEthernetStaticSetting = document.getElementById('static-setting');

  var gUpdateManualDialog = document.getElementById('update-manual-dialog');
  var gUpdateManualInput = document.getElementById('update-manual-input');
  var gUpdateManualCancelButton = document.getElementById('update-manual-cancel');
  var gUpdateManualConfirmButton = document.getElementById('update-manual-confirm');
  var gUpdateManualTitle = document.getElementById('update-manual-dialog-title');



  var gInformationDialog = document.getElementById('show-information-dialog');
  var gShowInformationOKButton = document.getElementById('ok-button');

  var gEthernetInformationSmallLabelIpAddress = document.querySelector('#ethernet-ip-address-infor-small-label');

  var gEthernetInformationSmallLabelGateway = document.querySelector('#ethernet-gateway-infor-small-label');

  var gEthernetInformationSmallLabelNetmark = document.querySelector('#ethernet-netmark-infor-small-label');

  var gEthernetInformationSmallLabelDNS1 = document.querySelector('#ethernet-dns1-infor-small-label');

  var gEthernetInformationSmallLabelDNS2 = document.querySelector('#ethernet-dns2-infor-small-label');



  function updateVisibilityStatus() {

    if (gEthernetManager.enabled) {
      gEthernetDynamic.hidden = false;

      displayEthernetSetting()

    } else {
        gEthernetDynamic.hidden = true;
//        gEthernetManual.hidden = true;
        gEthernetShowInfor.hidden = true;

        gEthernetIpAddress.hidden = true;
        gEthernetGateway.hidden = true;
        gEthernetNetmark.hidden = true;
        gEthernetDNS1.hidden = true;
        gEthernetDNS2.hidden = true;
    }

  };

    function displayEthernetSetting(){
          if (gEthernetDynamicCheckBox.checked) {

              gEthernetShowInfor.hidden = false;

              gEthernetIpAddress.hidden = true;
              gEthernetGateway.hidden = true;
              gEthernetNetmark.hidden = true;
              gEthernetDNS1.hidden = true;
              gEthernetDNS2.hidden = true;
          }
          else {
              gEthernetShowInfor.hidden = true;

              gEthernetIpAddress.hidden = false;
              gEthernetGateway.hidden = false;
              gEthernetNetmark.hidden = false;
              gEthernetDNS1.hidden = false;
              gEthernetDNS2.hidden = false;
          }
    };


  function showConnectionInfo() {
    if (gEthernetCheckBox.checked != gEthernetManager.enabled) {
      gEthernetCheckBox.checked = gEthernetManager.enabled;
    }
    if (gEthernetDynamicCheckBox.checked != gIsEthernetDynamic) {
      gEthernetDynamicCheckBox.checked = gIsEthernetDynamic;
    }
    
//    if (gEthernetManualCheckBox.checked == gIsEthernetDynamic) {
//      gEthernetManualCheckBox.checked = !gIsEthernetDynamic;
//    }
    
    if (gEthernetManager.enabled) {
      gEthernetSmallLabelIpAddress.textContent = gEthernetIpAddressValue;
      gEthernetSmallLabelGateway.textContent = gEthernetGatewayValue;
      gEthernetSmallLabelNetmark.textContent = gEthernetNetmarkValue;
      gEthernetSmallLabelDNS1.textContent = gEthernetDNS1Value;
      gEthernetSmallLabelDNS2.textContent = gEthernetDNS2Value;
    }
  };
  
  function updateConnectionInfo() {
    console.log("updateConnectionInfo");
    gEthernetIpAddressValue = gEthernetManager.ipAddress;
    gEthernetGatewayValue = gEthernetManager.gateway;
    gEthernetNetmarkValue = gEthernetManager.netmask;
    gEthernetDNS1Value = gEthernetManager.dns1;
    gEthernetDNS2Value = gEthernetManager.dns2;
  }
  
  function showUpdateManualDialog(aDialogTitle, aCurrentValue) {
    gUpdateManualTitle.textContent = aDialogTitle;
    gUpdateManualInput.value = aCurrentValue;
    gUpdateManualDialog.hidden = false;
    
    // Focus the input field to trigger showing the keyboard
    gUpdateManualInput.focus();
    var cursorPos = gUpdateManualInput.value.length;
    gUpdateManualInput.setSelectionRange(0, cursorPos);
  };

    function showInformationDialog() {
        gInformationDialog.hidden = false;
        gEthernetInformationSmallLabelIpAddress.textContent = gEthernetIpAddressValue;
        gEthernetInformationSmallLabelGateway.textContent = gEthernetGatewayValue;
        gEthernetInformationSmallLabelNetmark.textContent = gEthernetNetmarkValue;
        gEthernetInformationSmallLabelDNS1.textContent = gEthernetDNS1Value;
        gEthernetInformationSmallLabelDNS2.textContent = gEthernetDNS2Value;
    };
  
  var self = this;
  document.addEventListener('visibilitychange', updateVisibilityStatus);
  document.addEventListener('visibilitychange', showConnectionInfo);
  gEthernet.addEventListener('transitionend', function(evt) {
    if (evt.target == gEthernet) {
      updateVisibilityStatus();
      showConnectionInfo();
    }
  });
  
  gEthernetCheckBox.onchange = function e_toggleEthernet() {
    if (gEthernetCheckBox.checked) {
      Connectivity.enableEthernet();
    } else {
      Connectivity.disableEthernet();
    }
    gEthernetCheckBox.disabled = true;
  };
  
  Connectivity.ethernetEnabledChanged = function() {
    updateVisibilityStatus();
    if (gEthernetManager.enabled) {
      gEthernetInfoBlock.textContent = _('enabled');
      updateVisibilityStatus();
      showConnectionInfo();
    } else {
      gEthernetInfoBlock.textContent = _('disabled');
    }
    gEthernetCheckBox.disabled = false;
  };
  
  Connectivity.ethernetConnectedChanged = function() {
    if (gEthernetManager.connected) {
      gEthernetCheckBox.disabled = false;
      updateVisibilityStatus();
      showConnectionInfo();
    } else {
    }
  };
  
  gEthernetDynamicCheckBox.onchange = function e_toggleDynamic() {
    gIsEthernetDynamic = this.checked;
//    gEthernetManualCheckBox.checked = !gIsEthernetDynamic;
      displayEthernetSetting();
    if (gIsEthernetDynamic) {
      showConnectionInfo();
    }
  };
  
//  gEthernetManualCheckBox.onchange = function e_toggleManual() {
//    gIsEthernetDynamic = !this.checked;
//    gEthernetDynamicCheckBox.checked = gIsEthernetDynamic;
//    updateVisibilityStatus();
//    if (gIsEthernetDynamic) {
//      showConnectionInfo();
//    }
//  };
  
  gEthernetIpAddress.onclick = function e_updateIpAddress() {
    if (!gIsEthernetDynamic) {
      showUpdateManualDialog("IP-Address", gEthernetIpAddressValue);
    }
  };
  gEthernetGateway.onclick = function e_updateGateway() {
    if (!gIsEthernetDynamic) {
      showUpdateManualDialog("Gateway", gEthernetGatewayValue);
    }
  };
  gEthernetNetmark.onclick = function e_updateNetmark() {
    if (!gIsEthernetDynamic) {
      showUpdateManualDialog("Netmark", gEthernetNetmarkValue);
    }
  };
  gEthernetDNS1.onclick = function e_updateDNS1() {
    if (!gIsEthernetDynamic) {
      showUpdateManualDialog("DNS1", gEthernetDNS1Value);
    }
  };
  gEthernetDNS2.onclick = function e_updateDNS2() {
    if (!gIsEthernetDynamic) {
      showUpdateManualDialog("DNS2", gEthernetDNS2Value);
    }
  };
  gUpdateManualCancelButton.onclick = function e_updateCanceled() {
    gUpdateManualDialog.hidden = true;
  };
  gUpdateManualConfirmButton.onclick = function e_updateConfirmed() {
    gUpdateManualDialog.hidden = true;
    
    switch (gUpdateManualTitle.textContent) {
      case 'IP-Address':
        gEthernetIpAddressValue = gUpdateManualInput.value;
        break;
      case 'Gateway':
        gEthernetGatewayValue = gUpdateManualInput.value;
        break;
      case 'Netmark':
        gEthernetNetmarkValue = gUpdateManualInput.value;
        break;
      case 'DNS1':
        gEthernetDNS1Value = gUpdateManualInput.value;
        break;
      case 'DNS2':
        gEthernetDNS2Value = gUpdateManualInput.value;
        break;
      default:
    }
    showConnectionInfo();
  };

    gShowInformationOKButton.onclick= function e_hideInformationDialog(){
        gInformationDialog.hidden = true;
    }
    gEthernetShowInfor.onclick = function e_showEthernetInfor() {
        showInformationDialog();
    };
  
  //Update at start-up
  updateVisibilityStatus();
  updateConnectionInfo();
  showConnectionInfo();
  displayEthernetSetting();

  if (gEthernetManager.enabled) {
    gEthernetInfoBlock.textContent = _('enabled');
  } else {
    gEthernetInfoBlock.textContent = _('disabled');
  }
});
