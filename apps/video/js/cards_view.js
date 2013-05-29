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
    this.observer = new MutationObserver(mutationHandler.bind(this));
    this.config = { childList: true };
    this.gd = new GestureDetector(this.parent);
    this.cardwidth = 0;
    this.movedx = 0;

    this.isStopped = true;
    // Set the event listeners and handlers to interact with users
    this.parent.addEventListener('mousedown', mousedownHandler.bind(this));
    this.parent.addEventListener('mouseup', mouseupHandler.bind(this));
    this.parent.addEventListener('pan', panHandler.bind(this));
    this.parent.addEventListener('swipe', swipeHandler.bind(this));
  }

  //
  // Public methods
  //
  CV.prototype.start = function() {
    this.observer.observe(this.parent, this.config);
    this.gd.startDetecting();

    // Set overflowY: hidden to the parent so that
    // it will not be scrolled by user's panning
    this.parent.style.overflowX = 'hidden';
    this.parent.style.overflowY = 'hidden';

    this.isStopped = false;

    // This should only happen when start is called after mutationHandler
    if (this.cardwidth <= 0)
      this.cardwidth = this.children[0].clientWidth;

    this.index = 0;
    this.count = this.children.length;

    // XXX We will set all the children to opacity 0 so that
    // Users won't be able to see the cards moving
    // if the cards moves from the center to the show range
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].style.opacity = 0;
    }

    this.moveCards();
  };

  CV.prototype.stop = function() {
    this.observer.disconnect();
    this.gd.stopDetecting();

    // Reset all the children when stopping Cards View
    for (var i = 0; i < this.children.length; i++) {
      setItemStyles(this.children[i], 0, 1, 1, 'auto');

      var carddetails = this.children[i].getElementsByClassName('details')[0];
      carddetails.style.opacity = 1;
    }

    this.parent.style.overflowX = 'hidden';
    this.parent.style.overflowY = 'scroll';

    this.isStopped = true;
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
    if (this.isStopped)
      return;
  }

  function panHandler(event) {
    if (this.isStopped)
      return;

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
      var currentz = this.children[i].style.zIndex - 0;
      var newz = -Math.abs(distance + fix) + MIN_ZINDEX;

      if (currentz !== newz)
        this.children[i].style.zIndex = newz;
    }
  }

  function mouseupHandler() {
    if (this.isStopped)
      return;

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

  function swipeHandler(event) {
    if (this.isStopped)
      return;

    // TODO: If we want to enable swiping the cards
    // then we need to implement this function
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
