navigator.mozL10n.ready(function pf_init() {
  var input = document.querySelector('#photoFrame-status input');
  var sourceItem = document.getElementById('photoFrame-source');
  var durationItem = document.getElementById('photoFrame-duration');

  var refreshItemState = function(enabled) {
    sourceItem.hidden = durationItem.hidden = !enabled;
  };

  refreshItemState(input.checked);
  input.addEventListener('change', function pf_changed() {
    refreshItemState(input.checked);
  });
});
