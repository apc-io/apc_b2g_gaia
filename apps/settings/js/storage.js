/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

const MEDIA_TYPE = ['apps', 'music', 'pictures', 'videos', 'sdcard'];

var Volume = function(name, storages) {
  this.name = name;
  this.storages = storages;
  this.rootElement = document.getElementById(name + '-storage-summary');
  this.spaceBar = document.getElementById(name + '-space-bar');
  this.totalLabel = document.getElementById(name + '-total-space');
  this.usedLabel = document.getElementById(name + '-used-space');
  this.freeLabel = document.getElementById(name + '-free-space');
};

Volume.prototype.updateStorageInfo = function volume_updateStorageInfo() {
  // Update the storage details
  var self = this;
  this.getStats(function(sizes) {
    var usedSize = 0;
    var freeSize = sizes['free'];
    MEDIA_TYPE.forEach(function(type) {
      usedSize += sizes[type];
    });

    var totalSize = usedSize + freeSize;
    var usedPercentage = (totalSize == 0) ? 0 : (usedSize * 100 / totalSize);

    if (usedPercentage > 100) {
      usedPercentage = 100;
    }
    self.spaceBar.value = usedPercentage;

    DeviceStorageHelper.showFormatedSize(self.totalLabel, 'storageSize', totalSize);
    DeviceStorageHelper.showFormatedSize(self.usedLabel, 'storageSize', usedSize);
    DeviceStorageHelper.showFormatedSize(self.freeLabel, 'storageSize', freeSize);

    for (var type in Storage.typeUsed) {
      var label = Storage[type + 'Label'];
      DeviceStorageHelper.showFormatedSize(label, 'storageSize', Storage.typeUsed[type]);
    }
  });
};

Volume.prototype.getStats = function volume_getStats(callback) {
  var results = {};
  var current = MEDIA_TYPE.length;
  var storages = this.storages;
  MEDIA_TYPE.forEach(function(type) {
    var storage = storages[type];
    storage.usedSpace().onsuccess = function(e) {
      results[type] = e.target.result;
      Storage.typeUsed[type] += results[type];
      current--;
      if (current == 0) {
        storage.freeSpace().onsuccess = function(e) {
          results['free'] = e.target.result;
          if (callback)
            callback(results);
        };
      }
    };
  });
};

Volume.prototype.updateInfo = function volume_updateInfo(callback) {
  var self = this;
  var availreq = this.storages.sdcard.available();
  availreq.onsuccess = function availSuccess(evt) {
    var state = evt.target.result;
    switch (state) {
      case 'shared':
        self.setInfoUnavailable();
        break;
      case 'unavailable':
        self.setInfoUnavailable();
        break;
      case 'available':
        self.updateStorageInfo();
        break;
    }
    if (callback)
      callback(state);
  };
};

Volume.prototype.setInfoUnavailable = function volume_setInfoUnavailable() {
  var _ = navigator.mozL10n.get;
  this.totalLabel.textContent = _('size-not-available');
  this.totalLabel.dataset.l10nId = 'size-not-available';
  this.usedLabel.textContent = _('size-not-available');
  this.usedLabel.dataset.l10nId = 'size-not-available';
  this.freeLabel.textContent = _('size-not-available');
  this.freeLabel.dataset.l10nId = 'size-not-available';
  this.spaceBar.value = 0;
  for (var type in Storage.typeUsed) {
    Storage.typeUsed[type] = 0;
    Storage[type + 'Label'].textContent = _('size-not-available');
    Storage[type + 'Label'].dataset.l10nId = 'size-not-available';
  }
};

var Storage = {
  typeUsed: {
    'apps': 0,
    'music': 0,
    'pictures': 0,
    'videos': 0,
    'sdcard': 0
  },
  init: function ms_init() {
    this._volumeList = this.initAllVolumeObjects();

    this.documentStorageListener = false;
    this.updateListeners();

    for(var type in this.typeUsed) {
      this[type + 'Label'] = document.getElementById(type + '-used-space');
    }

    // Use mozvisibilitychange so that we don't get notified of device
    // storage notifications when the settings app isn't visible.
    document.addEventListener('mozvisibilitychange', this);
    window.addEventListener('localized', this);

    this.updateInfo();
  },

  initAllVolumeObjects: function ms_initAllVolumeObjects() {
    var volumes = {};
    MEDIA_TYPE.forEach(function(type) {
      var storages = navigator.getDeviceStorages(type);
      //FIXME we can only handle internal and "one" external storage now
      storages = storages.slice(0, 2);
      storages.forEach(function(storage, index) {
        var name = (index === 0)? 'device' : 'external';
        if (!volumes.hasOwnProperty(name)) {
          volumes[name] = {};
        }
        volumes[name][type] = storage;
      });
    });
    var _ = navigator.mozL10n.get;
    var volumeList = [];
    for (var name in volumes) {
      var volume = new Volume(name, volumes[name]);
      volumeList.push(volume);
    }
    return volumeList;
  },

  handleEvent: function ms_handleEvent(evt) {
    switch (evt.type) {
      case 'localized':
        this.updateInfo();
        break;
      case 'change':
        // we are handling storage state changes
        // possible state: available, unavailable, shared
        this.updateInfo();
        break;
      case 'mozvisibilitychange':
        this.updateListeners(this.updateInfo.bind(this));
        break;
    }
  },

  updateListeners: function ms_updateListeners(callback) {
    var self = this;
    if (document.mozHidden) {
      // Settings is being hidden. Unregister our change listener so we won't
      // get notifications whenever files are added in another app.
      if (this.documentStorageListener) {
        this._volumeList.forEach(function(volume) {
          // use sdcard storage to represent this volume
          var volumeStorage = volume.storages.sdcard;
          volumeStorage.removeEventListener('change', self);
        });
        this.documentStorageListener = false;
      }
    } else {
      if (!this.documentStorageListener) {
        this._volumeList.forEach(function(volume) {
          // use sdcard storage to represent this volume
          var volumeStorage = volume.storages.sdcard;
          volumeStorage.addEventListener('change', self);
        });
        this.documentStorageListener = true;
      }
      if (callback && document.location.hash === '#storage')
        callback();
    }
  },

  updateInfo: function ms_updateInfo() {
    var self = this;
    this._volumeList.forEach(function(volume) {
      volume.updateInfo();
    });
  }
  
};

var StackedBar = function(div) {
  var container = div;
  var items = [];
  var totalSize = 0;

  return {
    add: function sb_add(item) {
      totalSize += item.value;
      items.push(item);
    },

    refreshUI: function sb_refreshUI() {
      container.parentNode.hidden = false;
      items.forEach(function(item) {
        var className = 'color-' + item.type;
        var ele = container.querySelector('.' + className);
        if (!ele)
          ele = document.createElement('span');
        ele.classList.add(className);
        ele.classList.add('stackedbar-item');
        ele.style.width = (item.value * 100) / totalSize + '%';
        container.appendChild(ele);
      });
    },

    reset: function sb_reset() {
      items = [];
      totalSize = 0;
      container.parentNode.hidden = true;
    }
  };
};

navigator.mozL10n.ready(Storage.init.bind(Storage));
