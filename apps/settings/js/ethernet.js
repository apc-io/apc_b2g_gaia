'use strict';

// handle Ethernet settings
navigator.mozL10n.ready(function ethernetSettings() {
  var _ = navigator.mozL10n.get;
  
   
  var gEthernetManager = navigator.mozEthernetManager;
  if (!gEthernetManager) {
    return;
  }
  
  const Field = {
    IP: 1,
    Gateway: 2,
    Netmask: 3,
    DNS1: 4,
    DNS2: 5
  };

  function getL10NText(l10n_id, defaultText) {
    var text = _(l10n_id);
    return text ? text : defaultText;
  };

  const TextValue = {
    IP: getL10NText("ethernet-ip-address", "IP address"),
    Gateway: getL10NText("ethernet-gateway", "Gateway"),
    Netmask: getL10NText("ethernet-netmask", "Netmask"),
    DNS1: getL10NText("ethernet-dns1", "DNS1"),
    DNS2: getL10NText("ethernet-dns2", "DNS2"),
    DescDhcp: getL10NText("ethernet-dhcp-desc", "Automatic configure network address"),
    DescManual: getL10NText("ethernet-manual-desc", "Manual configure network address"),
  };

  // main UX bussiness
  var MainUX = {
    ethernetToggle: document.querySelector('#ethernet-enabled input'),
    dhcpToggleArea: document.querySelector('#ethernet-dhcp'),
    dhcpToggle: document.querySelector('#ethernet-dhcp input'),
    dhcpToggleDesc: document.querySelector('#ethernet-dhcp-small-label'),
    detailsConfig: document.querySelector("#ethernet-settings-details"),
    ipInfo: document.querySelector('#ethernet-ip-address-small-label'),
    gatewayInfo: document.querySelector('#ethernet-gateway-small-label'),
    netmaskInfo: document.querySelector('#ethernet-netmask-small-label'),
    dns1Info: document.querySelector('#ethernet-dns1-small-label'),
    dns2Info: document.querySelector('#ethernet-dns2-small-label'),

    init: function() {
      this.update();
      this.connectEvents();
    },

    onEthernetEnabledChanged: function(enabled) {
      this.ethernetToggle.checked = enabled;
      this.dhcpToggleArea.hidden = !enabled;
      this.detailsConfig.hidden = !enabled;
    },

    onDhcpChanged: function(enabled) {
      if (this.dhcpToggle.checked != enabled) {
        this.dhcpToggle.checked = enabled;
      }
      if (enabled) {
        this.detailsConfig.classList.add("disabled");
        this.dhcpToggleDesc.textContent = TextValue.DescDhcp;
        this.updateDetailsInfo(gEthernetManager.connection);
      } else {
        this.detailsConfig.classList.remove("disabled");
        this.dhcpToggleDesc.textContent = TextValue.DescManual;
        this.updateDetailsInfo(gEthernetManager.staticconfig);
      }
    },

    updateDetailsInfo: function(info) {
      this.ipInfo.textContent = info.ip;
      this.gatewayInfo.textContent = info.gateway;
      this.netmaskInfo.textContent = info.netmask;
      this.dns1Info.textContent = info.dns1;
      this.dns2Info.textContent = info.dns2;
    },

    update: function() {
      MainUX.onEthernetEnabledChanged(gEthernetManager.enabled);
      if (!gEthernetManager.enabled) {
        // nothing more to update
        return;
      }

      MainUX.onDhcpChanged(gEthernetManager.dhcp);
    },

    setIP: function(val) {
      this.ipInfo.textContent = val;
    },

    setGateway: function(val) {
      this.gatewayInfo.textContent = val;
    },

    setNetmask: function(val) {
      this.netmaskInfo.textContent = val;
    },

    setDNS1: function(val) {
      this.dns1Info.textContent = val;
    },

    setDNS2: function(val) {
      this.dns2Info.textContent = val;
    },

    connectEvents: function() {
      this.ethernetToggle.onchange = function() {
        if (this.ethernetToggle.checked) {
          Connectivity.enableEthernet();
        } else {
          Connectivity.disableEthernet();
        }
      }.bind(this);

      this.dhcpToggle.onchange = function() {
        gEthernetManager.setdhcp(this.dhcpToggle.checked);
      }.bind(this);

      function connectEditor(elementSelector, field) {
        var element = document.querySelector(elementSelector);
        if (element) {
          element.onclick = function() {
            IPAddressEditor.showEditor(field);
          }
        } else {
          dump("invalid element   " + elementSelector);
        }
      };

      connectEditor('#ethernet-ip-address', Field.IP);
      connectEditor('#ethernet-gateway', Field.Gateway);
      connectEditor('#ethernet-netmask', Field.Netmask);
      connectEditor('#ethernet-dns1', Field.DNS1);
      connectEditor('#ethernet-dns2', Field.DNS2);
    }
  };

  // this is the ux handling for settings elemenents inside Left panel of Settings App!
  // some how this should be put in Connectivity.js instead!
  var SettingsElement = {
    ethernetElement: document.querySelector('#ethernet-desc'),

    onEthernetEnabledChanged: function(enabled) {
      var text = enabled ? _('enabled') : _('disabled');
      this.ethernetElement.textContent = text;
    },
  };

  var EventProcessor = {
    init: function() {
      this.initConnectivityCallbacks();
      this.initEthernetManagerCallbacks();
      this.initSettingsAppCallbacks();
    },

    initConnectivityCallbacks: function() {
      Connectivity.ethernetEnabledChanged = function() {
        SettingsElement.onEthernetEnabledChanged(gEthernetManager.enabled);
        MainUX.onEthernetEnabledChanged(gEthernetManager.enabled);
      };

      Connectivity.ethernetConnectedChanged = function() {
        // nothing to do here, actually. This is useful for the notification icon only
      };
    },

    initEthernetManagerCallbacks: function() {
      gEthernetManager.ondhcpchanged = function() {
        MainUX.onDhcpChanged(gEthernetManager.dhcp);
      };

      gEthernetManager.onconnectionupdated = function() {
        if (gEthernetManager.enabled && gEthernetManager.dhcp) {
          MainUX.updateDetailsInfo(gEthernetManager.connection);
        }
      }
    },

    initSettingsAppCallbacks: function() {
      this.ethernetElement = document.querySelector('#ethernet');
      this.ethernetElement.addEventListener('transitionend', function(evt) {
        if (evt.target == this.ethernetElement) {
          MainUX.update();
        }
      });

      document.addEventListener('visibilitychange', MainUX.update);
    },
  };
  
  var IPAddressEditor = {
    editorWidget: document.getElementById('update-manual-dialog'),
    titleLabel: document.getElementById('update-manual-dialog-title'),
    inputEntry: document.getElementById('update-manual-input'),
    _init: false,
    _field: 0,

    init: function() {
      if (!this._init) {
        this.editorWidget.hidden = true;
        this.connectEvents();
        this._init = true;
      }
    },

    showEditor: function(field) {
      this.init();
      this._field = field;
      switch (field) {
        case Field.IP:
          this._setTitleValue(TextValue.IP, gEthernetManager.staticconfig.ip);
          break;
        case Field.Gateway:
          this._setTitleValue(TextValue.Gateway, gEthernetManager.staticconfig.gateway);
          break;
        case Field.Netmask:
          this._setTitleValue(TextValue.Netmask, gEthernetManager.staticconfig.netmask);
          break;
        case Field.DNS1:
          this._setTitleValue(TextValue.DNS1, gEthernetManager.staticconfig.dns1);
          break;
        case Field.DNS2:
          this._setTitleValue(TextValue.DNS2, gEthernetManager.staticconfig.dns2);
          break;
      }

      this.editorWidget.hidden = false;

      // Focus the input field to trigger showing the keyboard
      this.inputEntry.focus();
      var cursorPos = this.inputEntry.value.length;
      this.inputEntry.setSelectionRange(0, cursorPos);
    },

    onCancel: function() {
      this._field = 0;
      this.editorWidget.hidden = true;
    },

    onOk: function() {
      var value = this.inputEntry.value;
      switch (this._field) {
        case Field.IP:
          gEthernetManager.setaddr(value);
          MainUX.setIP(value);
          break;
        case Field.Gateway:
          gEthernetManager.setgateway(value);
          MainUX.setGateway(value);
          break;
        case Field.Netmask:
          gEthernetManager.setnetmask(value);
          MainUX.setNetmask(value);
          break;
        case Field.DNS1:
          gEthernetManager.setdns1(value);
          MainUX.setDNS1(value);
          break;
        case Field.DNS2:
          gEthernetManager.setdns2(value);
          MainUX.setDNS2(value);
          break;
        default:
          console.error("Error: Invalid field!" );
      }

      this._field = 0;
      this.editorWidget.hidden = true;
    },

    _setTitleValue: function(title, value) {
      this.titleLabel.textContent = title;
      this.inputEntry.value = value;
    },

    connectEvents: function() {
      var cancelButton = document.getElementById('update-manual-cancel');
      cancelButton.onclick = this.onCancel.bind(this);
      var okButton = document.getElementById('update-manual-confirm');
      okButton.onclick = this.onOk.bind(this);
    }
  }

  MainUX.init();
  EventProcessor.init();
});
