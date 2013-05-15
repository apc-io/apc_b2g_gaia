var Breadcrumb = function(_root) {
  var root = _root;
  var breadcrumbContainer = _root.querySelector('.breadcrumb-container');
  var hashQueue = [];

  var onPanelChange = function() {
    var prevHash = null;
    var curHash = document.location.hash;

    if (curHash === '#root')
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
    for (var i = 0; i < level; i++) {
      hashQueue.pop();
      breadcrumbContainer.removeChild(breadcrumbContainer.lastElementChild);

      if (hashQueue.length > 0)
        breadcrumbContainer.removeChild(breadcrumbContainer.lastElementChild);
    }
  };
  var forward = function(hash) {
    // waiting for the panel gets loaded
    setTimeout(function() {
      hashQueue.push(hash);

      var header = document.querySelector(hash + " h1");
      var item = createItem(hash, header.textContent);

      if (hashQueue.length > 1) {
        var span = document.createElement('h1');
        span.textContent = '>'
        breadcrumbContainer.appendChild(span);
      }
      breadcrumbContainer.appendChild(item);
    });
  };
  var reset = function(hash) {
    hashQueue = [];
    while (breadcrumbContainer.firstElementChild)
      breadcrumbContainer.removeChild(breadcrumbContainer.firstElementChild);
    if (hash)
      forward(hash);
  };

  var createItem = function(hash, title) {
    // <a><h1></h1></a>
    var link = document.createElement('a');
    var header = document.createElement('h1');
    
    link.href = hash;
    header.textContent = title;
    
    link.appendChild(header);
    return link;
  };

  window.addEventListener('hashchange', onPanelChange);

  return {};
};
