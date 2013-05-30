'use strict';
var screenLock = null;
var photoFrameTimeID = null;

var PhotoFrame = {
  toggle: false,

  photoSource: 'wallpaper',

  duration: 2,

  photoBatch: [],

  photoBatchLength: 0,

  loadDelay: 0,

  frontFrame: null,

  backFrame: null,

  imageIndex: 0,

  frameWidth: 1280,

  frameHeight: 800,

  get landingPage() {
    return document.getElementById('landing-page');
  },

  get frameSet() {
    return document.getElementById('frame-set');
  },

  get footer() {
    return document.getElementById('footer');
  },

  get frame1() {
    return document.getElementById('frame1');
  },

  get frame2() {
    return document.getElementById('frame2');
  },

  get paginationBar() {
    return document.getElementById('paginationBar');
  },

  playFrames: function PF_playFrames() {
    var self = this;
    if (self.photoBatchLength == 0) {
      // no image in source
      self.stopFrames();
    } else {
      if (!screenLock) {
        screenLock = navigator.requestWakeLock('screen');
      }
      self.paginationBar.style.display = 'none';
      self.frameSet.classList.remove('hidden');
      self.footer.classList.add('hidden');
      self.landingPage.mozRequestFullScreen();
      self.setImage(self.frontFrame, 'show');
    }
  },

  stopFrames: function PF_stopFrames() {
    if (screenLock) {
      screenLock.unlock();
      screenLock = null;
    }

    if (photoFrameTimeID != null) {
      clearTimeout(photoFrameTimeID);
      photoFrameTimeID = null;
      document.mozCancelFullScreen();
      this.paginationBar.style.display = 'block';
      this.frameSet.classList.add('hidden');
      this.footer.classList.remove('hidden');
      this.setToggle(false);
      this.imageIndex = 0;
      this.photoBatch = [];
      this.frame1.src = this.frame2.src = '';
      this.frame1.style.opacity = this.frame2.style.opacity =  0.01;
    }
  },

  setImage: function PF_setImage(targetImg, action) {
    var self = this;
    if (self.photoSource === 'wallpaper') {
      targetImg.src = self.photoBatch[self.imageIndex];
    } else {
      photoDB.getFile(self.photoBatch[self.imageIndex], function(result) {
        targetImg.src = URL.createObjectURL(result);
      });
    }
    self.imageIndex = ((self.imageIndex + 1) % self.photoBatchLength);
    targetImg.addEventListener('load', function revoke(event) {
      targetImg.removeEventListener('load', revoke);
      self.computeFit(targetImg);
      if (action == 'show') {
        self.showImage();
        self.setImage(self.backFrame, 'changeImage');
      } else {
        self.changeImage();
      }
    });
  },

  showImage: function PF_showImage(ele) {
    this.frontFrame.style.opacity = 1;
  },

  changeImage: function PF_showImage() {
    var self = this;
    if (photoFrameTimeID == null) {
      photoFrameTimeID = window.setTimeout(function() {
        var temp = self.frontFrame;
        self.frontFrame = self.backFrame;
        self.backFrame = temp;
        self.showImage();
        self.backFrame.style.opacity = 0.01;
        self.backFrame.addEventListener('transitionend', function revok() {
          self.backFrame.removeEventListener('transitionend', revok);
          self.backFrame.src = '';
          self.setImage(self.backFrame, 'changeImage');
        });
        clearTimeout(photoFrameTimeID);
        photoFrameTimeID = null;
      }, (self.duration * 1000));
    }
  },

  landingPagePress: function landingPagePress() {
    if (this.toggle) {
      this.stopFrames();
    }
  },

  checkToggle: function PF_checkToggle() {
    var self = this;
    if (self.toggle) {
      if (self.photoSource === 'wallpaper') {
        self.generateWallpaperList();
      } else {
        self.generateSDList();
      }
    }
  },

  updateToggle: function PF_updateToggle() {
    var self = this;
    var req = navigator.mozSettings.createLock().get('photoFrame.enabled');
    req.onsuccess = (function onsuccess() {
      self.toggle = req.result['photoFrame.enabled'];
    });
  },

  updatePhotoSource: function PF_updatePhotoSource() {
    var self = this;
    var req_2 = navigator.mozSettings.createLock().get('photoFrame.source');
    req_2.onsuccess = (function onsuccess() {
      self.photoSource = req_2.result['photoFrame.source'];
    });
  },

  updateDuration: function PF_duration() {
    var self = this;
    var req_3 = navigator.mozSettings.createLock().get('photoFrame.duration');
    req_3.onsuccess = (function onsuccess() {
      self.duration = req_3.result['photoFrame.duration'];
    });
  },

  setToggle: function PF_setToggle(value) {
    var lock = navigator.mozSettings.createLock();
    var result = lock.set({
      'photoFrame.enabled': value
    });

    result.onsuccess = function() {
      this.toggle = false;
    };

    result.onerror = function() {
      this.toggle = false;
    };
  },

  generateWallpaperList: function PF_generateWallpaperList() {
    // wall paper hardcode
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'shared/resources/wallpaper/1280x800/list.json', true);
    xhr.responseType = 'json';
    xhr.send(null);

    xhr.onload = function successGenerateWallpaperList() {
      xhr.response.forEach(function(wallpaper) {
        self.photoBatch.push('shared/resources/wallpaper/1280x800/' +
        wallpaper);
      });
      // source, photoBatch and duration are ready, let's go playFrames.
      self.photoBatchLength = self.photoBatch.length;
      self.playFrames();
    };
  },

  generateSDList: function PF_generateSDList() {
    cloneToPhotoBatch();
    this.photoBatchLength = this.photoBatch.length;
    this.playFrames();
  },

  computeFit: function PF_computeFit(item) {
    var scalex = this.frameWidth / item.width;
    var scaley = this.frameHeight / item.height;
    var scale = Math.min(Math.min(scalex, scaley), 1);

    // Set the image size and position
    var width = Math.floor(item.width * scale);
    var height = Math.floor(item.height * scale);

    var left = Math.floor((this.frameWidth - width) / 2);
    var top = Math.floor((this.frameHeight - height) / 2);

    var transform = 'translate(' + left + 'px,' + top + 'px) ' +
    'scale(' + scale + ')';

    item.style.transform = transform;
  },

  setFrameSize: function PF_setFrameSize() {
    this.frameWidth = this.landingPage.offsetWidth;
    this.frameHeight = this.landingPage.offsetHeight;
  },

  init: function() {
    this.landingPage.addEventListener('click',
      this.landingPagePress.bind(this));
    this.frontFrame = this.frame1;
    this.backFrame = this.frame2;
    this.updateToggle();
    this.updatePhotoSource();
    this.updateDuration();
    this.setFrameSize();
    initDB();
  }
};

window.addEventListener('resize', function() {
  PhotoFrame.setFrameSize();
  PhotoFrame.computeFit(PhotoFrame.frontFrame);
  PhotoFrame.computeFit(PhotoFrame.backFrame);
});

navigator.mozSettings.addObserver('photoFrame.enabled', function (event) {
  PhotoFrame.toggle = event.settingValue;
});

navigator.mozSettings.addObserver('photoFrame.source', function (event) {
  PhotoFrame.photoSource = event.settingValue;
  if (PhotoFrame.photoSource === 'sdcard') {
    initThumbnails();  // update photoDB
  }
});

navigator.mozSettings.addObserver('photoFrame.duration', function (event) {
  PhotoFrame.duration = event.settingValue;
});

var videostorage;
var PAGE_SIZE = 15;
var loader = LazyLoader;
var files = [];
var photoDB;
var visibilityMonitor;
var scanningBigImages = false;

// Initialize MediaDB objects for photos and videos, and set up their
// event handlers.
function initDB() {
  photoDB = new MediaDB('pictures', metadataParserWrapper, {
    mimeTypes: ['image/jpeg', 'image/png'],
    version: 2,
    autoscan: false,     // We're going to call scan() explicitly
    batchHoldTime: 150,  // Batch files during scanning
    batchSize: PAGE_SIZE // Max batch size: one screenful
  });
  // This is where we find videos once the photoDB notifies us that a
  // new video poster image has been detected. Note that we need this
  // even during a pick activity when we're not displaying videos
  // because we might still might find and parse metadata for new
  // videos during the scanning process.
  videostorage = navigator.getDeviceStorage('videos');

  var loaded = false;
  function metadataParserWrapper(file, onsuccess, onerror) {
    if (loaded) {
      metadataParser(file, onsuccess, onerror);
      return;
    }

    loader.load('shared/js/metadata_scripts.js', function() {
      loaded = true;
      metadataParser(file, onsuccess, onerror);
    });
  }

  // This is called when DeviceStorage becomes unavailable because the
  // sd card is removed or because it is mounted for USB mass storage
  // This may be called before onready if it is unavailable to begin with
  // We don't need one of these handlers for the video db, since both
  // will get the same event at more or less the same time.

  photoDB.onready = function() {
    initThumbnails();
  };

  photoDB.onscanend = function onscanend() {
    scanningBigImages = false;
  };

  // One or more files was created (or was just discovered by a scan)
  photoDB.oncreated = function(event) {
    event.detail.forEach(fileCreated);
  };

  // One or more files were deleted (or were just discovered missing by a scan)
  photoDB.ondeleted = function(event) {
    event.detail.forEach(fileDeleted);
  };
}

function fileDeleted(filename) {
  // Find the deleted file in our files array
  for (var n = 0; n < files.length; n++) {
    if (files[n].name === filename)
      break;
  }

  if (n >= files.length)  // It was a file we didn't know about
    return;

  // Remove the image from the array
  var deletedImageData = files.splice(n, 1)[0];
}

function fileCreated(fileinfo) {
  files.push(fileinfo);
}

function initThumbnails() {
  // If we've already been called once, then we've already got thumbnails
  // displayed. There is no need to re-enumerate them, so we just go
  // straight to scanning for new files
  if (visibilityMonitor) {
    photoDB.scan();
    return;
  }

  var visibilityMargin = 5060;
  var minimumScrollDelta = 4000;

  var batch = [];
  var batchsize = PAGE_SIZE;

  photoDB.enumerate('date', null, 'prev', function(fileinfo) {
    if (fileinfo) {
      // For a pick activity, don't display videos
      if (fileinfo.metadata.video)
        return;

      batch.push(fileinfo);
      if (batch.length >= batchsize) {
        flush();
        batchsize *= 2;
      }
    }
    else {
      done();
    }
  });

  function flush() {
    batch.forEach(thumb);
    batch.length = 0;
  }

  function thumb(fileinfo) {
    files.push(fileinfo);              // remember the file
  }

  function done() {
    flush();
    photoDB.scan();
  }
}

function cloneToPhotoBatch() {
  for (var n = 0; n < files.length; n++) {
    PhotoFrame.photoBatch.push(files[n].name);
  }
}
