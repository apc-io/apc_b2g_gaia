'use strict';

/*
 * The HomeButtonManager is a component which handle events of home button.
 * The user can return to home screen by click on home button (on status bar).
 * The user can see running apps by long pressing on home button (on status bar).
 */
var homeButtonHoldTimer = null;
var HOME_BUTTON_HOLD_INTERVAL = 750;
var isHomeButtonClicked = false;
var HomeButtonManager = {
  homeButton: null,

  init: function hbm_init() {
    this.homeButton = document.getElementById('statusbar-home-button-container');
    this.homeButton.onmousedown = this.homeButtonPressed.bind(this);
    this.homeButton.onmouseup = this.homeButtonReleased.bind(this);
  },
  
  homeButtonPressed: function hbm_homeButtonPresser() {
    isHomeButtonClicked = true;
    homeButtonHoldTimer = setTimeout(function() {
      isHomeButtonClicked = false;
      window.dispatchEvent(new Event('holdhome'));
    }, HOME_BUTTON_HOLD_INTERVAL);
  },
  
  homeButtonReleased: function hbm_homeButtonReleaser() {
    if (isHomeButtonClicked) {
      window.dispatchEvent(new Event('home'));
    }
    clearTimeout(homeButtonHoldTimer);
    homeButtonHoldTimer = null;
  }
};

window.addEventListener('localized', function startup(evt) {
  window.removeEventListener('localized', startup);

  HomeButtonManager.init();
});
