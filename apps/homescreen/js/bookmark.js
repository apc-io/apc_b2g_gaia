'use strict';

var Bookmark = function Bookmark(params) {
  this.removable = true;

  if ('iconable' in params) {
    this.iconable = params.iconable;
  } else {
    this.iconable = true;
  }

  this.isBookmark = true;
  this.url = this.bookmarkURL = this.origin = params.bookmarkURL;

  this.manifest = {
    name: params.name,
    icons: {
      60: params.icon
    },
    default_locale: 'en-US'
  };

  this.useAsyncPanZoom = 'useAsyncPanZoom' in params && params.useAsyncPanZoom;
};

Bookmark.prototype = {
  launch: function bookmark_launch() {
    var features = {
      name: this.manifest.name.replace(/\s/g, '&nbsp;'),
      icon: this.manifest.icons['60'],
      remote: true,
      useAsyncPanZoom: this.useAsyncPanZoom
    };

    // The third parameter is received in window_manager without whitespaces
    // so we decice replace them for &nbsp;
    // window.open(this.url, '_blank', JSON.stringify(features));
    // Customized workaround of wrapper UI
    new MozActivity({
        name: 'view',
        data: {
          type: 'url',
          url: this.url
        }
    });
  },

  uninstall: function bookmark_uninstall() {
    GridManager.uninstall(this);
  }
};

var BookmarkEditor = {
  init: function bookmarkEditor_show(options) {
    this.data = options.data;
    this.onsaved = options.onsaved;
    this.oncancelled = options.oncancelled;

    this.origin = document.location.protocol + '//homescreen.' +
      document.location.host.replace(/(^[\w\d]+.)?([\w\d]+.[a-z]+)/, '$2');
  },

  close: function bookmarkEditor_close() {
    this.oncancelled();
  },

  save: function bookmarkEditor_save() {
    // Only allow http(s): urls to be bookmarked.
    var bookmarkUrl = this.data.url;
    if (/^https?:/.test(bookmarkUrl) == false)
      return;

    var message = {
      name: this.data.name,
      bookmarkURL: this.data.url,
      icon: this.data.icon
    };

    window.postMessage(
      new Message(Message.Type.ADD_BOOKMARK, message),
      this.origin
    );
    this.onsaved();
  }
};
