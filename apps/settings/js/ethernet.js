'use strict';

// handle Ethernet settings
navigator.mozL10n.ready(function ethernetSettings() {
  
  var settings = window.navigator.mozSettings;
  if (!settings)
    return;
    
  //var gEthernetManager = navigator.mozEthernetManager;

  var gEthernet = document.querySelector('#ethernet');
  var gEthernetCheckBox = document.querySelector('#ethernet-enabled input');
  var gEthernetDynamic = document.querySelector('#ethernet-dynamic');
  var gEthernetDynamicCheckBox = document.querySelector('#ethernet-dynamic input');
  var gEthernetManual = document.querySelector('#ethernet-manual');
  var gEthernetManualCheckBox = document.querySelector('#ethernet-manual input');
  
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
  
  var gIsEthernetEnabled = true;
  var gIsEthernetDynamic = true;
  var gEthernetIpAddressValue = "192.168.0.13";
  var gEthernetGatewayValue = "22.11.2.2";
  var gEthernetNetmarkValue = "33.34.3";
  var gEthernetDNS1Value = "545";
  var gEthernetDNS2Value = "3543";
  
  //Currently, only DHCP is supported
  //gEthernetDynamicCheckBox.disabled = true;
  //gEthernetManualCheckBox.disabled = true;
  
  //manual settings elements
  var gUpdateManualDialog = document.getElementById('update-manual-dialog');
  var gUpdateManualInput = document.getElementById('update-manual-input');
  var gUpdateManualCancelButton = document.getElementById('update-manual-cancel');
  var gUpdateManualConfirmButton = document.getElementById('update-manual-confirm');
  var gUpdateManualTitle = document.getElementById('update-manual-dialog-title');
  
  function updateVisibilityStatus() {
    if (gIsEthernetEnabled) {
      gEthernetDynamic.hidden = false;
      gEthernetManual.hidden = false;
      
      gEthernetIpAddress.hidden = false;
      gEthernetGateway.hidden = false;
      gEthernetNetmark.hidden = false;
      gEthernetDNS1.hidden = false;
      gEthernetDNS2.hidden = false;
    } else {
      gEthernetDynamic.hidden = true;
      gEthernetManual.hidden = true;
      gEthernetIpAddress.hidden = true;
      gEthernetGateway.hidden = true;
      gEthernetNetmark.hidden = true;
      gEthernetDNS1.hidden = true;
      gEthernetDNS2.hidden = true;
    }
  };
  
  function updateSettingValues() {
    if (gEthernetCheckBox.checked != gIsEthernetEnabled) {
      gEthernetCheckBox.checked = gIsEthernetEnabled;
    }
    if (gEthernetDynamicCheckBox.checked != gIsEthernetDynamic) {
      gEthernetDynamicCheckBox.checked = gIsEthernetDynamic;
    }
    
    if (gEthernetManualCheckBox.checked == gIsEthernetDynamic) {
      gEthernetManualCheckBox.checked = !gIsEthernetDynamic;
    }
    
    if (gIsEthernetEnabled) {
      gEthernetSmallLabelIpAddress.textContent = gEthernetIpAddressValue;
      gEthernetSmallLabelGateway.textContent = gEthernetGatewayValue;
      gEthernetSmallLabelNetmark.textContent = gEthernetNetmarkValue;
      gEthernetSmallLabelDNS1.textContent = gEthernetDNS1Value;
      gEthernetSmallLabelDNS2.textContent = gEthernetDNS2Value;
    }
  };
  
  function showUpdateManualDialog(aDialogTitle, aCurrentValue) {
    gUpdateManualTitle.textContent = aDialogTitle;
    gUpdateManualInput.value = aCurrentValue;
    gUpdateManualDialog.hidden = false;
    
    // Focus the input field to trigger showing the keyboard
    gUpdateManualInput.focus();
    var cursorPos = gUpdateManualInput.value.length;
    gUpdateManualInput.setSelectionRange(0, cursorPos);
  };
  
  var self = this;
  document.addEventListener('visibilitychange', updateVisibilityStatus);
  document.addEventListener('visibilitychange', updateSettingValues);
  gEthernet.addEventListener('transitionend', function(evt) {
    if (evt.target == gEthernet) {
      updateVisibilityStatus();
      updateSettingValues();
    }
  });
  
  gEthernetCheckBox.onchange = function e_toggleEthernet() {
    gIsEthernetEnabled = gEthernetCheckBox.checked;
    updateVisibilityStatus();
    updateSettingValues();
    
    /*if (gEthernetCheckBox.checked) {
      gEthernetManager.enable();
    } else {
      gEthernetManager.disable();
    }*/
  };
  
  /*settings.addObserver('ethernet.enabled', function(event) {
    console.log("ethernet enabled setting changed=========" + event.settingValue);
  });
  
  gEthernetManager.onenabledchanged = function() {
    console.log("onenabledchanged==============================ethernet");
  };
  
  gEthernetManager.onconnectedchanged = function() {
    console.log("onconnectedchanged==============================ethernet");
  };*/
  
  gEthernetDynamicCheckBox.onchange = function e_toggleDynamic() {
    gIsEthernetDynamic = this.checked;
    gEthernetManualCheckBox.checked = !gIsEthernetDynamic;
    updateVisibilityStatus();
    if (gIsEthernetDynamic) {
      updateSettingValues();
    }
  };
  
  gEthernetManualCheckBox.onchange = function e_toggleManual() {
    gIsEthernetDynamic = !this.checked;
    gEthernetDynamicCheckBox.checked = gIsEthernetDynamic;
    updateVisibilityStatus();
    if (gIsEthernetDynamic) {
      updateSettingValues();
    }
  };
  
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
    updateSettingValues();
  };
  
  //Update at start-up
  updateVisibilityStatus();
  updateSettingValues();
});
