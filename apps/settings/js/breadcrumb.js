var Breadcrumb = function(_root) {
  var root = _root;
  var breadcrumbContainer = _root.querySelector('.breadcrumb-container');
  var hashQueue = [];

  var onPanelChange = function() {
    var prevHash = null;
    var curHash = document.location.hash;

    if (curHash === '#root' || curHash === '')
      return;

    if (hashQueue.length > 0) {
      prevHash = hashQueue[hashQueue.length - 1];
    }

    if (!prevHash) {
      forward(curHash);
    } else {
      if (prevHash === curHash)
        return;

      var prevLevels = prevHash.split('-');
      var curLevels = curHash.split('-');
      var prevLevelLength = prevLevels.length;
      var curLevelLength = curLevels.length;
      if (curLevelLength > prevLevelLength) {
        forward(curHash);
      } else if (curLevelLength < prevLevelLength) {
        if (prevLevels[0] !== curLevels[0]) {
          reset(curHash);
        } else {
          back(prevLevelLength - curLevelLength);
        }
      } else if (prevLevelLength === 1 && curLevelLength === 1) {
        reset(curHash);
      }
    }
  };

  var back = function(level) {
    var allItems =
      Array.prototype.slice.call(breadcrumbContainer.querySelectorAll('.item'));
    for (var i = 0; i < level; i++) {
      hashQueue.pop();
      var lastItem = allItems.shift();
      breadcrumbContainer.removeChild(lastItem);
    }
  };
  var forward = function(hash) {
    // waiting for the panel gets loaded
    setTimeout(function() {
      hashQueue.push(hash);

      var header = document.querySelector(hash + ' h1');
      var item = createItem(hash, header.textContent);

      /* We use flex:row-reverse in the container. Thus we need to find the
       * first item and insert the new item before it istead of simply appending
       * to the end. The best selector to get the first item is
       * '.item:first-of-type'. However, it does not work for some
       * reason. So we use an alternative '.item:nth-child(2)' here.
       */
      var curFirstItem = _root.querySelector('.item:nth-child(2)');

      breadcrumbContainer.insertBefore(item, curFirstItem);
    });
  };
  var reset = function(hash) {
    hashQueue = [];

    var allItems =
      Array.prototype.slice.call(breadcrumbContainer.querySelectorAll('.item'));
    allItems.forEach(function(item) {
      breadcrumbContainer.removeChild(item);
    });

    if (hash)
      forward(hash);
  };

  var createItem = function(hash, title) {
    // <a><h1></h1></a>
    var link = document.createElement('a');
    var header = document.createElement('h1');

    link.classList.add('item');
    link.href = hash;
    header.textContent = title;

    link.appendChild(header);
    return link;
  };

  window.addEventListener('hashchange', onPanelChange);

  return {};
};
