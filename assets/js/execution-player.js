(function () {
  let activePlayer = null;

  function initializePlayer(player) {
    const canvas = player.querySelector('canvas');
    const context = canvas.getContext('2d');
    const playButton = player.querySelector('[data-action="play"]');
    const status = player.querySelector('[data-role="status"]');
    const directory = player.dataset.frameDirectory;
    const frameCount = Number(player.dataset.frameCount);
    const frames = [];
    let frameIndex = 0;
    let timer = null;

    const drawFrame = index => {
      const image = frames[index];
      if (!image || !image.complete) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    for (let index = 1; index <= frameCount; index += 1) {
      const image = new Image();
      image.src = `${directory}/frame-${String(index).padStart(2, '0')}.png`;
      image.onload = () => {
        if (index === 1) drawFrame(0);
      };
      frames.push(image);
    }

    const pause = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
      playButton.textContent = 'Play';
      playButton.setAttribute('aria-pressed', 'false');
      status.textContent = 'Paused';
    };

    const play = () => {
      if (activePlayer && activePlayer !== pause) activePlayer();
      activePlayer = pause;
      playButton.textContent = 'Pause';
      playButton.setAttribute('aria-pressed', 'true');
      status.textContent = 'Playing';
      timer = window.setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        drawFrame(frameIndex);
      }, 950);
    };

    playButton.addEventListener('click', () => (timer ? pause() : play()));
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-execution-player]').forEach(initializePlayer);
  });
})();