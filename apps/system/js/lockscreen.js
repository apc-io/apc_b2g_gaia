/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
var watch = {
  enumerable: false,
  configurable: true,
  writable: false,
  value: function(prop, handler) {
    var oldval = this[prop],
        newval = oldval;
    var getter = function() {
      return newval;
    };
    var setter = function(val) {
      oldval = newval;
      handler.call(this, prop, oldval, val);
      return newval = val;
    };

    if (delete this[prop]) { // can't watch constants
      Object.defineProperty(this, prop, {
        get: getter, set: setter,
        enumerable: true, configurable: true
      });
    }
  }
};

var unwatch = {
  enumerable: false, configurable: true, writable: false,
  value: function(prop) {
    var val = this[prop];
    delete this[prop]; // remove accessors
    this[prop] = val;
  }
};

if (Object.prototype.watch !== watch) {
  Object.defineProperty(Object.prototype, 'watch', watch);
}

// object.unwatch
if (Object.prototype.unwatch !== unwatch) {
  Object.defineProperty(Object.prototype, 'unwatch', unwatch);
}

var LockScreenView = {
  /**
   * Object reference to LockScreen data object
   */
  lockscreen: null,

  /**
   * Are we currently switching panels ?
   */
  _switchingPanel: false,

  /*
  * Timeout ID for backing from triggered state to normal state
  */
  triggeredTimeoutId: 0,

  /*
  * Timeout after incorrect attempt
  */
  kPassCodeErrorTimeout: 500,

  /*
  * Interval ID for elastic of curve and arrow
  */
  elasticIntervalId: 0,

  /*
  * elastic animation interval
  */
  ELASTIC_INTERVAL: 5000,

  /*
  * timeout for triggered state after swipe up
  */
  TRIGGERED_TIMEOUT: 7000,

  /*
  * Max value for handle swiper up
  */
  HANDLE_MAX: 70,

  init: function lsv_init(lockscreen) {
    var self = this;
    this.getAllElements();
    var watchTable = [
      {
        'obj': lockscreen, 'prop': 'connstateLine1',
        'callback': this.onPropertyChanged
      },
      {
        'obj': lockscreen, 'prop': 'connstateLine2',
        'callback': this.onStateLine2Changed
      },
      {
        'obj': lockscreen, 'prop': 'panel',
        'callback': this.onPanelChanging
      },
      {
        'obj': lockscreen, 'prop': 'passCodeEntered',
        'callback': this.updatePassCodeUI
      },
      {
        'obj': lockscreen, 'prop': 'locked',
        'callback': this.onLockChanged
      },
      {
        'obj': lockscreen, 'prop': 'clockNumbers',
        'callback': this.onPropertyChanged
      },
      {
        'obj': lockscreen, 'prop': 'clockMeridiem',
        'callback': this.onPropertyChanged
      },
      {
        'obj': lockscreen, 'prop': 'date',
        'callback': this.onPropertyChanged
      },
      {
        'obj': lockscreen, 'prop': 'passcodeStatus',
        'callback': this.onPasscodeStatusChanged
      },
      {
        'obj': lockscreen, 'prop': 'mute',
        'callback': (function(id, oldval, val) {
          this.mute.hidden = !val;
        })
      },
      {
        'obj': lockscreen, 'prop': 'vibration',
        'callback': (function(id, oldval, val) {
          if (val) {
            this.mute.classList.add('vibration');
          } else {
            this.mute.classList.remove('vibration');
          }
        })
      },
      {
        'obj': lockscreen, 'prop': 'background',
        'callback': (function(id, oldval, val) {
          this.updateBackground(val);
          this.overlay.classList.remove('uninit');
        })
      },
      {
        'obj': lockscreen, 'prop': 'elastic',
        'callback': this.onElasticChanged
      }
    ];

    watchTable.forEach(function(el) {
      el['obj'].watch(el['prop'], el['callback'].bind(self));
    });

    this.lockscreen = lockscreen;

    /* Status changes */
    window.addEventListener('screenchange', this);

    /* Gesture */
    this.area.addEventListener('mousedown', this);
    this.areaCamera.addEventListener('click', this);
    this.areaUnlock.addEventListener('click', this);
    this.iconContainer.addEventListener('mousedown', this);

    /* Unlock & camera panel clean up */
    this.overlay.addEventListener('transitionend', this);

    /* Passcode input pad*/
    this.passcodePad.addEventListener('click', this);

    if (this.lockscreen.conn && this.lockscreen.conn.voice) {
      this.connstate.hidden = false;
    }
  },

  handleEvent: function lsv_handleEvent(evt) {
    switch (evt.type) {
      case 'screenchange':
        // Remove camera once screen turns off
        if (!evt.detail.screenEnabled && this.camera.firstElementChild) {
          this.camera.removeChild(this.camera.firstElementChild);
        }
        break;

      case 'click':
        if (evt.target === this.areaUnlock) {
          this.lockscreen.launchUnlock();
        } else if (evt.target === this.areaCamera) {
          this.lockscreen.launchCamera();
        } else if (evt.target.dataset.key) {
          // Cancel the default action of <a>
          evt.preventDefault();
          this.lockscreen.handlePassCodeInput(evt.target.dataset.key);
        }
        break;
      case 'mousedown':
        var leftTarget = this.areaCamera;
        var rightTarget = this.areaUnlock;
        var handle = this.areaHandle;
        var overlay = this.overlay;
        var target = evt.target;

        // Reset timer when touch while overlay triggered
        if (overlay.classList.contains('triggered')) {
          clearTimeout(this.triggeredTimeoutId);
          this.triggeredTimeoutId = setTimeout(this.unloadPanel.bind(this),
                                               this.TRIGGERED_TIMEOUT);
          break;
        }

        overlay.classList.remove('elastic');
        this.lockscreen.setElasticEnabled(false);

        this._touch = {
          touched: false,
          leftTarget: leftTarget,
          rightTarget: rightTarget,
          overlayWidth: this.overlay.offsetWidth,
          handleWidth: this.areaHandle.offsetWidth,
          maxHandleOffset: rightTarget.offsetLeft - handle.offsetLeft -
            (handle.offsetWidth - rightTarget.offsetWidth) / 2
        };
        window.addEventListener('mouseup', this);
        window.addEventListener('mousemove', this);

        this._touch.touched = true;
        this._touch.initX = evt.pageX;
        this._touch.initY = evt.pageY;
        overlay.classList.add('touched');
        break;

      case 'mousemove':
        this.handleMove(evt.pageX, evt.pageY);
        break;

      case 'mouseup':
        window.removeEventListener('mousemove', this);
        window.removeEventListener('mouseup', this);

        this.handleMove(evt.pageX, evt.pageY);
        this.handleGesture();
        delete this._touch;
        this.overlay.classList.remove('touched');

        break;

      case 'transitionend':
        if (evt.target !== this.overlay) {
          return;
        }

        if (this.overlay.dataset.panel !== 'camera' &&
            this.camera.firstElementChild) {
          this.camera.removeChild(this.camera.firstElementChild);
        }

        if (!this.lockscreen.locked.state) {
          this.lockscreen.panel = 'main';
        }
        break;

      case 'home':
        if (this.lockscreen.locked.state) {
          this.lockscreen.panel = 'main';
          evt.stopImmediatePropagation();
        }
        break;

      case 'holdhome':
        if (!this.lockscreen.locked.state) {
          return;
        }

        evt.stopImmediatePropagation();
        evt.stopPropagation();
        break;
    }
  },

  handleMove: function lsv_handleMove(pageX, pageY) {
    var touch = this._touch;

    if (!touch.touched) {
      // Do nothing if the user have not move the finger to the handle yet
      if (document.elementFromPoint(pageX, pageY) !== this.areaHandle)
        return;

      touch.touched = true;
      touch.initX = pageX;
      touch.initY = pageY;

      var overlay = this.overlay;
      overlay.classList.add('touched');
    }

    var dy = pageY - touch.initY;
    var ty = Math.max(- this.HANDLE_MAX, dy);
    var base = - ty / this.HANDLE_MAX;
    // mapping position 20-100 to opacity 0.1-0.5
    var opacity = base <= 0.2 ? 0.1 : base * 0.5;
    touch.ty = ty;

    this.iconContainer.style.transform = 'translateY(' + ty + 'px)';
    this.areaCamera.style.opacity =
      this.areaUnlock.style.opacity = opacity;
  },

  handleGesture: function lsv_handleGesture() {
    var touch = this._touch;
    if (touch.ty < -50) {
      this.areaHandle.style.transform =
        this.areaHandle.style.opacity =
        this.iconContainer.style.transform =
        this.iconContainer.style.opacity =
        this.areaCamera.style.transform =
        this.areaCamera.style.opacity =
        this.areaUnlock.style.transform =
        this.areaUnlock.style.opacity = '';
      this.overlay.classList.add('triggered');

      this.triggeredTimeoutId =
        setTimeout(this.unloadPanel.bind(this), this.TRIGGERED_TIMEOUT);
    } else if (touch.ty > -10) {
      touch.touched = false;
      this.unloadPanel();
      this.playElastic();

      var self = this;
      var container = this.iconContainer;
      container.addEventListener('animationend', function prompt() {
        container.removeEventListener('animationend', prompt);
        self.overlay.classList.remove('elastic');
        self.lockscreen.setElasticEnabled(true);
      });
    } else {
      this.unloadPanel();
      this.lockscreen.setElasticEnabled(true);
    }
  },

  getAllElements: function lsv_getAllElements() {
    // ID of elements to create references
    var elements = ['connstate', 'mute', 'clock-numbers', 'clock-meridiem',
        'date', 'area', 'area-unlock', 'area-camera', 'icon-container',
        'area-handle', 'passcode-code',
        'passcode-pad', 'camera', 'accessibility-camera',
        'accessibility-unlock', 'panel-emergency-call'];

    var toCamelCase = function toCamelCase(str) {
      return str.replace(/\-(.)/g, function replacer(str, p1) {
        return p1.toUpperCase();
      });
    };

    elements.forEach((function createElementRef(name) {
      this[toCamelCase(name)] = document.getElementById('lockscreen-' + name);
    }).bind(this));

    this.overlay = document.getElementById('lockscreen');
    this.mainScreen = document.getElementById('screen');

    this.connstateLine1 = this.connstate.firstElementChild;
    this.connstateLine2 = this.connstate.lastElementChild;
  },

  loadPanel: function lsv_loadPanel(panel, callback) {
    switch (panel) {
      case 'passcode':
      case 'main':
        if (callback)
          setTimeout(callback);
        break;

      case 'emergency-call':
        // create the <iframe> and load the emergency call
        var frame = document.createElement('iframe');

        frame.src = './emergency-call/index.html';
        frame.onload = function emergencyCallLoaded() {
          if (callback)
            callback();
        };
        this.panelEmergencyCall.appendChild(frame);
        break;

      case 'camera':
        // create the <iframe> and load the camera
        var frame = document.createElement('iframe');

        frame.src = './camera/index.html';
        var mainScreen = this.mainScreen;
        frame.onload = function cameraLoaded() {
          mainScreen.classList.add('lockscreen-camera');
          if (callback)
            callback();
        };
        this.overlay.classList.remove('no-transition');
        this.camera.appendChild(frame);
        break;
    }
  },

  unloadPanel: function lsv_unloadPanel(panel, toPanel, callback) {
    var self = this;
    var unloadMainPanel = function() {
      var unload = function unload() {
        self.areaHandle.style.transform =
          self.areaUnlock.style.transform =
          self.areaCamera.style.transform =
          self.iconContainer.style.transform =
          self.iconContainer.style.opacity =
          self.areaHandle.style.opacity =
          self.areaUnlock.style.opacity =
          self.areaCamera.style.opacity = '';
        self.overlay.classList.remove('triggered');
        self.areaHandle.classList.remove('triggered');
        self.areaCamera.classList.remove('triggered');
        self.areaUnlock.classList.remove('triggered');

        clearTimeout(self.triggeredTimeoutId);
        self.lockscreen.setElasticEnabled(true);
      };

      if (toPanel !== 'camera') {
        unload();
        return;
      }

      self.overlay.addEventListener('transitionend',
        function ls_unloadDefaultPanel(evt) {
          if (evt.target !== self)
            return;

          self.overlay.removeEventListener('transitionend',
                                           ls_unloadDefaultPanel);
          unload();
        }
      );
    };

    var lookupTable = {
      'passcode': function() {
        // Reset passcode panel only if the status is not error
        if (self.overlay.dataset.passcodeStatus == 'error') {
          return;
        }

        delete self.overlay.dataset.passcodeStatus;
        self.lockscreen.passCodeEntered = '';
      },
      'camera': function() {
        self.mainScreen.classList.remove('lockscreen-camera');
      },
      'emergency-call': function() {
        var ecPanel = self.panelEmergencyCall;
        ecPanel.addEventListener('transitionend', function unloadPanel() {
          ecPanel.removeEventListener('transitionend', unloadPanel);
          ecPanel.removeChild(ecPanel.firstElementChild);
        });
      },
      'main': unloadMainPanel
    };

    if (lookupTable[panel]) {
      lookupTable[panel]();
    } else {
      unloadMainPanel();
    }

    if (callback)
      setTimeout(callback);
  },

  onStateLine2Changed: function lsv_onConnstateLine2(id, oldval, val) {
    if (val) {
      this.connstate.classList.add('twolines');
      this.connstateLine2.textContent = val;
    } else {
      this.connstate.classList.remove('twolines');
      this.connstateLine2.textContent = '';
    }
  },

  onPanelChanging: function lsv_onPanelChanging(id, oldval, panel) {
    if (this._switchingPanel) {
      return panel;
    }

    panel = panel || 'main';
    var overlay = this.overlay;
    var currentPanel = overlay.dataset.panel;

    if (currentPanel && currentPanel === panel) {
      return panel;
    }

    var self = this;

    this._switchingPanel = true;
    this.loadPanel(panel, function panelLoaded() {
      self.unloadPanel(overlay.dataset.panel, panel,
        function panelUnloaded() {
          self.lockscreen.dispatchEvent('lockpanelchange', { 'panel': panel });

          overlay.dataset.panel = panel;
          self._switchingPanel = false;
        });
    });
    return panel;
  },

  updatePassCodeUI: function lsv_updatePassCodeUI(id, oldval, val) {
    var overlay = this.overlay;
    if (overlay.dataset.passcodeStatus) {
      return;
    }
    if (val) {
      overlay.classList.add('passcode-entered');
    } else {
      overlay.classList.remove('passcode-entered');
    }
    var i = 4;
    while (i--) {
      var span = this.passcodeCode.childNodes[i];
      if (val.length > i) {
        span.dataset.dot = true;
      } else {
        delete span.dataset.dot;
      }
    }
  },

  onLockChanged: function lsv_onLockChanged(id, oldval, val) {
    if (val.instant) {
      this.overlay.classList.add('no-transition');
    } else {
      this.overlay.classList.remove('no-transition');
    }

    this.lockscreen.panel = 'main';

    if (!val.state) {
      this.mainScreen.classList.remove('locked');
      if (oldval.state !== val.state && !val.instant &&
          this.lockscreen.unlockSoundEnabled) {
        var unlockAudio = new Audio('./resources/sounds/unlock.ogg');
        unlockAudio.play();
      }

      this.mainScreen.focus();
    } else {
      this.overlay.focus();
      this.mainScreen.classList.add('locked');
      screen.mozLockOrientation('portrait-primary');
    }
  },

  onPasscodeStatusChanged: function lsv_onPasscodeChanged(id, oldval, val) {
    var self = this;
    this.overlay.dataset.passcodeStatus = val;
    if (val === 'success') {
      var transitionend = function() {
        self.passcodeCode.removeEventListener('transitionend', transitionend);
        self.lockscreen.unlock();
      };
      this.passcodeCode.addEventListener('transitionend', transitionend);
    } else if (val === 'error') {
      if ('vibrate' in navigator)
        navigator.vibrate([50, 50, 50]);

      var self = this;
      setTimeout(function error() {
        self.lockscreen.passcodeStatus = '';
        self.lockscreen.passCodeEntered = '';
      }, this.kPassCodeErrorTimeout);
    }
  },

  onPropertyChanged: function lsv_onPropertyChanged(id, oldval, val) {
    if (this[id] && this[id] instanceof HTMLElement) {
      this[id].textContent = val;
    }
  },

  updateBackground: function lsv_updateBackground(value) {
    var panels = document.querySelectorAll('.lockscreen-panel');
    var url = 'url(' + value + ')';
    for (var i = 0; i < panels.length; i++) {
      panels[i].style.backgroundImage = url;
    }
  },

  onElasticChanged: function lsv_onElasticChanged(id, oldval, value) {
    clearInterval(this.elasticIntervalId);
    if (value) {
      this.elasticIntervalId =
        setInterval(this.playElastic.bind(this), this.ELASTIC_INTERVAL);
    }
  },

  playElastic: function lsv_playElastic() {
    if (this._touch && this._touch.touched)
      return;

    var overlay = this.overlay;
    var container = this.iconContainer;

    overlay.classList.add('elastic');
    container.addEventListener('animationend', function animationend(e) {
      container.removeEventListener(e.type, animationend);
      overlay.classList.remove('elastic');
    });
  }
};

var LockScreen = {
  l10n: null,
  connstateLine1: '',
  connstateLine2: '',
  clockNumbers: null,
  clockMeridiem: null,
  date: null,
  dateFormatter: null,
  conn: null,
  mobileOperator: null,
  ftuLauncher: null,
  panel: null,
  settings: null,
  settingsListener: null,
  passcodeStatus: null,
  mute: false,
  vibration: true,
  background: null,
  screenEnabled: true,
  elastic: false,

  /*
  * Boolean return true when initialized.
  */
  ready: false,

  /*
  * Boolean return the status of the lock screen.
  * Must not multate directly - use unlock()/lockIfEnabled()
  * Listen to 'lock' and 'unlock' event to properly handle status changes
  */
  locked: { state: true, instant: false},

  /*
  * Boolean return whether if the lock screen is enabled or not.
  * Must not multate directly - use setEnabled(val)
  * Only Settings Listener should change this value to sync with data
  * in Settings API.
  */
  enabled: true,

  /*
  * Airplane mode
  */
  airplaneMode: false,

  /*
  * Boolean returns wether we want a sound effect when unlocking.
  */
  unlockSoundEnabled: true,

  /*
  * Boolean return whether if the lock screen is enabled or not.
  * Must not multate directly - use setPassCodeEnabled(val)
  * Only Settings Listener should change this value to sync with data
  * in Settings API.
  * Will be ignored if 'enabled' is set to false.
  */
  passCodeEnabled: false,

  /*
  * Four digit Passcode
  * XXX: should come for Settings
  */
  passCode: '0000',

  /*
  * The time to request for passcode input since device is off.
  */
  passCodeRequestTimeout: 0,

  /*
  * Current passcode entered by the user
  */
  passCodeEntered: '',

  /**
   * Object used for handling the clock UI element, wraps all related timers
   */
  clock: null,

  /*
  * Store the first time the screen went off since unlocking.
  */
  _screenOffTime: 0,

  /*
  * Check the timeout of passcode lock
  */
  _passCodeTimeoutCheck: false,

  init: function ls_init(options) {
    for (var key in options) {
      if (this.hasOwnProperty(key)) {
        this[key] = options[key];
      }
    }

    if (this.ready) { // already initialized: just trigger a translation
      this.refreshClock(new Date());
      this.updateConnState();
      return;
    }
    this.ready = true;
    this.lockIfEnabled(true);
    this.writeSetting(this.enabled);

    /* Status changes */
    window.addEventListener('screenchange', this);

    /* switching panels */
    window.addEventListener('home', this);

    /* blocking holdhome and prevent Cards View from show up */
    window.addEventListener('holdhome', this, true);

    /* mobile connection state on lock screen */
    if (this.conn && this.conn.voice) {
      this.conn.addEventListener('voicechange', this);
      this.conn.addEventListener('cardstatechange', this);
      this.conn.addEventListener('iccinfochange', this);
      this.updateConnState();
    }

    var self = this;
    var observers = [
      {
        'prop': 'lockscreen.enabled', 'default': true,
        'callback': self.setEnabled.bind(this)
      },
      {
        'prop': 'ring.enabled', 'default': true,
        'callback': (function(value) {
          self.mute = !value;
        })
      },
      {
        'prop': 'vibration.enabled', 'default': true,
        'callback': (function(value) {
          self.vibration = value;
        })
      },
      {
        'prop': 'ril.radio.disabled', 'default': false,
        'callback': (function(value) {
          self.airplaneMode = value;
          self.updateConnState();
        })
      },
      {
        'prop': 'wallpaper.image',
        'default': 'resources/images/backgrounds/default.png',
        'callback': (function(value) {
          self.background = value;
        })
      },
      {
        'prop': 'lockscreen.passcode-lock.code', 'default': '0000',
        'callback': (function(value) {
          self.passCode = value;
        })
      },
      {
        'prop': 'lockscreen.passcode-lock.enabled', 'default': false,
        'callback': self.setPassCodeEnabled.bind(self)
      },
      {
        'prop': 'lockscreen.unlock-sound.enabled', 'default': true,
        'callback': self.setUnlockSoundEnabled.bind(self)
      },
      {
        'prop': 'lockscreen.passcode-lock.timeout', 'default': 0,
        'callback': (function(value) {
          self.passCodeRequestTimeout = value;
        })

      }
    ];
    observers.forEach(function(el) {
      self.settingsListener.observe(el['prop'], el['default'], el['callback']);
    });
  },

  handleEvent: function ls_handleEvent(evt) {
    switch (evt.type) {
      case 'screenchange':
        // XXX: If the screen is not turned off by ScreenManager
        // we would need to lock the screen again
        // when it's being turned back on
        if (!evt.detail.screenEnabled) {
          // Don't update the time after we're already locked otherwise turning
          // the screen off again will bypass the passcode before the timeout.
          if (!this.locked.state) {
            this._screenOffTime = new Date().getTime();
          }

          // Stop refreshing the clock when the screen is turned off.
          this.clock.stop();
        } else {
          var _screenOffInterval = new Date().getTime() - this._screenOffTime;
          if (_screenOffInterval > this.passCodeRequestTimeout * 1000) {
            this._passCodeTimeoutCheck = true;
          } else {
            this._passCodeTimeoutCheck = false;
          }

          // Resume refreshing the clock when the screen is turned on.
          this.clock.start(this.refreshClock.bind(this));
        }
        this.lockIfEnabled(true);
        this.screenEnabled = evt.detail.screenEnabled;
        this.setElasticEnabled(this.screenEnabled);
        break;
      case 'voicechange':
      case 'cardstatechange':
      case 'iccinfochange':
        this.updateConnState();
        break;
    }
  },

  handlePassCodeInput: function ls_handlePassCodeInput(key) {
    var self = this;
    var lookupTable = {
      'e': function() {
        self.panel = 'emergency-call';
      },
      'c': function() {
        self.panel = 'main';
      },
      'b': function() {
        if (self.passcodeStatus) {
          return;
        }

        this.passCodeEntered =
            this.passCodeEntered.substr(0, this.passCodeEntered.length - 1);
      },
      'default': function() {
        if (self.passcodeStatus) {
          return;
        }
        self.passCodeEntered += key;

        if (self.passCodeEntered.length === 4) {
          var entered = self.passCodeEntered;
          self.passcodeStatus = (entered === self.passCode) ?
                                'success' : 'error';
        }
      }
    };

    if (lookupTable[key]) {
      lookupTable[key]();
    } else {
      lookupTable['default']();
    }
  },

  lockIfEnabled: function ls_lockIfEnabled(instant) {
    if (this.ftuLauncher && this.ftuLauncher.isFtuRunning()) {
      this.unlock(instant);
      return;
    }

    if (this.enabled) {
      this.lock(instant);
    } else {
      this.unlock(instant);
    }
  },

  unlock: function ls_unlock(instant, detail) {
    // This file is loaded before the Window Manager in order to intercept
    // hardware buttons events. As a result WindowManager is not defined when
    // the device is turned on and this file is loaded.
    var currentApp =
      'WindowManager' in window ? WindowManager.getDisplayedApp() : null;

    var currentFrame = null;

    if (currentApp) {
      currentFrame = WindowManager.getAppFrame(currentApp).firstChild;
      WindowManager.setOrientationForApp(currentApp);
    }

    var wasAlreadyUnlocked = !this.locked.state;
    this.locked = { 'state': false, 'instant': instant || false};

    var repaintTimeout = 0;
    var nextPaint = (function() {
      clearTimeout(repaintTimeout);

      if (currentFrame) {
        currentFrame.removeNextPaintListener(nextPaint);
      }

      if (!wasAlreadyUnlocked) {
        // Any changes made to this,
        // also need to be reflected in apps/system/js/storage.js
        this.dispatchEvent('unlock', detail);
        this.writeSetting(false);
      }
    }).bind(this);

    if (currentFrame) {
      currentFrame.addNextPaintListener(nextPaint);
    }

    repaintTimeout = setTimeout(function ensureUnlock() {
      nextPaint();
    }, 200);
    this.dispatchEvent('will-unlock');
    this.clock.stop();
    this.setElasticEnabled(false);
  },

  lock: function ls_lock(instant) {
    var wasAlreadyLocked = this.locked.state;
    this.locked = {'state': true, 'instant': instant || false};

    if (!wasAlreadyLocked) {
      if (document.mozFullScreen)
        document.mozCancelFullScreen();

      // Any changes made to this,
      // also need to be reflected in apps/system/js/storage.js
      this.dispatchEvent('lock');
      this.writeSetting(true);
    }
    this.setElasticEnabled(true);
  },

  launchCamera: function ls_launchCamera() {
    if (this.passCodeEnabled && this._passCodeTimeoutCheck) {
      // Go to secure camera panel
      this.panel = 'camera';
      return;
    }
    this.unlock(null, {areaCamera: true});

    var a = new MozActivity({
      name: 'record',
      data: {
        type: 'photos'
      }
    });
    a.onerror = function ls_activityError() {
      console.log('MozActivity: camera launch error.');
    };
  },

  launchUnlock: function ls_launchUnlock() {
    if (!this.passCodeEnabled || !this._passCodeTimeoutCheck) {
      this.unlock();
    } else {
      this.panel = 'passcode';
    }
  },

  refreshClock: function ls_refreshClock(now) {
    if (!this.locked.state) {
      return;
    }

    var f = this.dateFormatter;
    var _ = this.l10n.get;

    var timeFormat = _('shortTimeFormat');
    var dateFormat = _('longDateFormat');
    var time = f.localeFormat(now, timeFormat);
    this.clockNumbers = time.match(/([012]?\d).[0-5]\d/g);
    this.clockMeridiem = (time.match(/AM|PM/i) || []).join('');
    this.date = f.localeFormat(now, dateFormat);
  },

  updateConnState: function ls_updateConnState() {
    if (!this.conn) {
      return;
    }

    this.l10n.ready(function() {
      var _ = this.l10n.get;
      // Reset line 2
      this.connstateLine2 = '';

      if (this.airplaneMode) {
        this.connstateLine1 = _('airplaneMode');
        return;
      }

      var voice = this.conn.voice;

      // Possible value of voice.state are:
      // 'notSearching', 'searching', 'denied', 'registered',
      // where the latter three mean the phone is trying to grab the network.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=777057
      if ('state' in voice && voice.state == 'notSearching') {
        this.connstateLine1 = _('noNetwork');
        return;
      }

      if (!voice.connected && !voice.emergencyCallsOnly) {
        // "Searching"
        // voice.state can be any of the latter three values.
        // (it's possible that the phone is briefly 'registered'
        // but not yet connected.)
        this.connstateLine1 = _('searching');
        return;
      }

      if (voice.emergencyCallsOnly) {
        this.connstateLine1 = _('emergencyCallsOnly');

        var state = this.conn.cardState;
        var table = {
          'unknown': 'emergencyCallsOnly-unknownSIMState',
          'absent': 'emergencyCallsOnly-noSIM',
          'pinRequired': 'emergencyCallsOnly-pinRequired',
          'pukRequired': 'emergencyCallsOnly-pukRequired',
          'networkLocked': 'emergencyCallsOnly-networkLocked',
          'serviceProviderLocked': 'emergencyCallsOnly-serviceProviderLocked',
          'corporateLocked': 'emergencyCallsOnly-corporateLocked'
        };
        this.connstateLine2 = table[state] ? _(table[state]) : '';
        return;
      }

      var operatorInfos = this.mobileOperator.userFacingInfo(this.conn);
      if (this.cellbroadcastLabel) {
        this.connstateLine2['text'] = this.cellbroadcastLabel;
      } else if (operatorInfos.carrier) {
        this.connstateLine2['text'] = operatorInfos.carrier + ' ' +
          operatorInfos.region;
      }

      var operator = operatorInfos.operator;

      if (voice.roaming) {
        var l10nArgs = { operator: operator };
        this.connstateLine1 = _('roaming', JSON.stringify(l10nArgs));
        return;
      }

      this.connstateLine1 = operator;
    }.bind(this));
  },

  /*
  * Set enabled state.
  * If enabled state is somehow updated when the lock screen is enabled
  * This function will unlock it.
  */
  setEnabled: function ls_setEnabled(val) {
    if (typeof val === 'string') {
      this.enabled = val == 'false' ? false : true;
    } else {
      this.enabled = val;
    }

    if (!this.enabled && this.locked.state) {
      this.unlock();
    }
    if (this.enabled) {
      this.setElasticEnabled(true);
    }
  },

  setPassCodeEnabled: function ls_setPassCodeEnabled(val) {
    if (typeof val === 'string') {
      this.passCodeEnabled = val == 'false' ? false : true;
    } else {
      this.passCodeEnabled = val;
    }
  },

  setUnlockSoundEnabled: function ls_setUnlockSoundEnabled(val) {
    if (typeof val === 'string') {
      this.unlockSoundEnabled = val == 'false' ? false : true;
    } else {
      this.unlockSoundEnabled = val;
    }
  },

  setElasticEnabled: function ls_setElasticEnabled(val) {
    if (this.enabled && this.locked.state && this.screenEnabled && val) {
      this.elastic = true;
    } else {
      this.elastic = false;
    }
  },

  dispatchEvent: function ls_dispatchEvent(name, detail) {
    var evt = document.createEvent('CustomEvent');
    var evt = new CustomEvent(name, {
      'bubbles': true,
      'cancelable': true,
      // Set event detail if needed for the specific event 'name' (relevant for
      // passing which button triggered the event)
      'detail': detail
    });
    window.dispatchEvent(evt);
  },

  writeSetting: function ls_writeSetting(value) {
    if (!this.settings) {
      return;
    }

    this.settingsListener.getSettingsLock().set({
      'lockscreen.locked': value
    });
  }
};

var options = {
  'dateFormatter': navigator.mozL10n.DateTimeFormat(),
  'l10n': navigator.mozL10n,
  'conn': navigator.mozMobileConnection,
  'mobileOperator': MobileOperator,
  'ftuLauncher': FtuLauncher,
  'settings': navigator.mozSettings,
  'settingsListener': SettingsListener,
  'clock': new Clock()
};

// Bug 836195 - [Homescreen] Dock icons drop down in the UI
// consistently when using a lockcode and visiting camera
LockScreen.init(options);

navigator.mozL10n.ready(LockScreen.init.bind(LockScreen, options));
LockScreenView.init(LockScreen);
