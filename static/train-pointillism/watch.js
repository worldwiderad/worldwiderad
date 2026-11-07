(() => {
  'use strict';
  const video = document.getElementById('film');
  const status = document.getElementById('status');
  const retry = document.getElementById('retry');
  const source = '/static/train-pointillism/1080p/index.m3u8';
  let player;
  function showError(message) {
    status.textContent = message;
    retry.hidden = false;
  }
  function setup() {
    if (player) { player.destroy(); player = undefined; }
    retry.hidden = true;
    status.textContent = 'Loading the film…';
    if (window.Hls && Hls.isSupported()) {
      player = new Hls({ maxBufferLength: 12, maxMaxBufferLength: 24, backBufferLength: 12 });
      player.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) showError('The film could not load. Check your connection and try again.');
      });
      player.loadSource(source);
      player.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      status.textContent = 'This browser cannot play the film. Please open this page in a current version of Safari, Chrome, Firefox or Edge.';
    }
  }
  video.addEventListener('canplay', () => { status.textContent = ''; retry.hidden = true; });
  video.addEventListener('error', () => showError('The film could not play. Check your connection and try again.'));
  retry.addEventListener('click', setup);
  window.addEventListener('pagehide', () => { if (player) player.stopLoad(); });
  window.addEventListener('pageshow', event => { if (event.persisted && player) player.startLoad(); });
  setup();
})();
