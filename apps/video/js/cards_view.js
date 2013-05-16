'use strict';

var SHOW_COUNT = 5;
var SCALE_RATIO = 0.8;
var OPACITY_STEP = 0.4;
var MIN_ZINDEX = 10;

var CardsView = (function() {

  //
  // Constructor
  //
  function CV(parent) {
    this.children = parent.children;
    this.parent = parent;
    this.count = 0;
    this.index = 0;
    this.gd = null;
    this.cardwidth = 0;
    this.movedx = 0;
  }

  //
  // Public methods
  //
  CV.prototype.start = function() {
    var observer = new MutationObserver(mutationHandler.bind(this));
    var config = { childList: true };

    observer.observe(this.parent, config);

    this.gd = new GestureDetector(this.parent);
    this.gd.startDetecting();

    // Set the event listeners and handlers to interact with users
    this.parent.addEventListener('mousedown', mousedownHandler.bind(this));
    this.parent.addEventListener('mouseup', mouseupHandler.bind(this));
    this.parent.addEventListener('pan', panHandler.bind(this));

    // Set overflow to the parent so that
    // it will not be scrolled by user's panning
    this.parent.style.overflow = 'hidden';
  };

  CV.prototype.moveCards = function() {
    var start = this.index - Math.floor(SHOW_COUNT / 2) - 1;
    var end = this.index + Math.ceil(SHOW_COUNT / 2) + 1;

    for (var i = start; i < end; i++) {
      if (i < 0 || i >= this.count)
        continue;

      var distance = i - this.index;

      var cx = this.cardwidth / 2 * distance;
      var sx = Math.pow(SCALE_RATIO, Math.abs(distance));
      var opacity = 1 - OPACITY_STEP * Math.abs(distance);
      var z = -Math.abs(distance) + MIN_ZINDEX;

      setItemStyles(this.children[i], cx, sx, opacity, z);

      // We should separate these action to another handler or callback
      // because this only works for the thumbnails in video app
      var carddetails = this.children[i].getElementsByClassName('details')[0];
      if (i === this.index)
        carddetails.style.opacity = 1;
      else
        carddetails.style.opacity = 0;
    }
  };

  CV.prototype.next = function() {
    this.index++;
    this.moveCards();
  };

  CV.prototype.previous = function() {
    this.index--;
    this.moveCards();
  };

  CV.prototype.revert = function() {
    this.moveCards();
  };

  function mutationHandler(mutations) {
    mutations.forEach(function(mutation) {
      // The mutation is the new appended card
      var card = mutation.addedNodes[0];

      // We get the original width from the first card
      if (this.count === 0)
        this.cardwidth = card.clientWidth;

      var distance = this.count - this.index;
      var bound = this.index + Math.ceil(SHOW_COUNT / 2);
      var predistance = (distance > bound) ? bound : distance;

      var cx = this.cardwidth / 2 * predistance;
      var sx = Math.pow(SCALE_RATIO, Math.abs(predistance));
      var opacity = 0;
      var z = -Math.abs(predistance) + MIN_ZINDEX;

      // Set default card styles for every new appended card
      setItemStyles(card, cx, sx, opacity, z);

      // Move cards to the right position
      this.moveCards();

      // TODO: When users add/remove files from SD card
      // We should handle the new/removed files and reflect them on the ui

      this.count++;
    }.bind(this));
  }

  function mousedownHandler() {
    // If we want to stop an transition then we have to handle this event
    // like using window.getComputedStyle() to get the styles when user taps
  }

  function panHandler(event) {
    var dx = event.detail.relative.dx;
    var fix = (this.movedx < 0) ? 1 : -1;
    this.movedx += dx;

    if (Math.abs(this.movedx) > this.cardwidth / 2) {
      return;
    }

    var start = this.index - Math.floor(SHOW_COUNT / 2) - 1;
    var end = this.index + Math.ceil(SHOW_COUNT / 2) + 1;

    for (var i = start; i < end; i++) {
      if (i < 0 || i >= this.count)
        continue;

      var distance = this.index - i;

      var currentx = this.children[i].dataset.currentx - 0;
      var absolutex = this.movedx + currentx;
      var fromscalex = Math.pow(SCALE_RATIO, Math.abs(distance));
      var toscalex = Math.pow(SCALE_RATIO, Math.abs(distance + fix));

      var fromopacity = 1 - OPACITY_STEP * Math.abs(distance);
      var toopacity = 1 - OPACITY_STEP * Math.abs(distance + fix);

      var ratio = Math.abs(this.movedx) / (this.cardwidth / 2);
      var sx = fromscalex - (fromscalex - toscalex) * ratio;
      var op = fromopacity - (fromopacity - toopacity) * ratio;

      this.children[i].style.transform = 'translateX(' + absolutex + 'px) ' +
                                         'scale(' + sx + ')';
      this.children[i].style.opacity = op;
      this.children[i].style.transition = 'transform 0ms ease, ' +
                                          'opacity 0ms ease, ' +
                                          'z-index 150ms ease';
      // Do we need to change the z-index while panning?
      // If we want, just set values to this.children[i].style.zIndex
    }
  }

  function mouseupHandler() {
    var needmove = Math.abs(this.movedx) > this.cardwidth / 4;

    if (needmove && this.movedx > 0 && this.index > 0) {
      this.previous();
    } else if (needmove && this.movedx < 0 && this.index < this.count - 1) {
      this.next();
    } else {
      this.revert();
    }

    this.movedx = 0;
  }

  function setItemStyles(card, cx, sx, op, z) {
    card.style.transform = 'translateX(' + cx + 'px) scale(' + sx + ')';
    card.style.opacity = op;
    card.style.transition = 'transform 300ms ease, ' +
                            'opacity 300ms ease, ' +
                            'z-index 150ms ease';
    card.style.zIndex = z;

    card.dataset.currentx = cx;
  }

  return CV;
}());
