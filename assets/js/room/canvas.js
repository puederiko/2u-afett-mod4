let canvasEffect = null;

let remoteCanvasEffect = null;

const noFilter = (ctx, videoEl) => {
  ctx.drawImage(videoEl, 0, 0, ctx.canvas.width, ctx.canvas.height);
};

const pixelate = (ctx, videoEl) => {
  const pixelSize = 10;
  const scale = 1 / pixelSize;
  const wScaled = ctx.canvas.width * scale;
  const hScaled = ctx.canvas.height * scale;
  ctx.drawImage(videoEl, 0, 0, wScaled, hScaled);
  ctx.mozImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    ctx.canvas,
    0,
    0,
    wScaled,
    hScaled,
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height
  );
};

const invert = (ctx, videoEl) => {
  ctx.drawImage(videoEl, 0, 0, ctx.canvas.width, ctx.canvas.height);
  //get the canvas data
  var data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  //invert each pixel
  for (let n = 0; n < data.width * data.height; n++) {
    var index = n * 4;
    data.data[index + 0] = 255 - data.data[index + 0];
    data.data[index + 1] = 255 - data.data[index + 1];
    data.data[index + 2] = 255 - data.data[index + 2];
    //don't touch the alpha
  }

  //set the data back
  ctx.putImageData(data, 0, 0);
};

const renderCanvas = (canvasEl, videoEl, isRemote = false) => {
  const ctx = canvasEl.getContext("2d");
  videoEl.play();

  const draw = () => {
    // clear the screen
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const effect = isRemote ? remoteCanvasEffect : canvasEffect;
    switch (effect) {
      case "CANVAS_PIXELATE":
        pixelate(ctx, videoEl);
        break;
      case "CANVAS_INVERT":
        invert(ctx, videoEl);
        break;
      case "NO_FILTER":
        noFilter(ctx, videoEl);
        break;
      default:
        noFilter(ctx, videoEl);
        break;
    }
    window.requestAnimationFrame(draw);
  };

  draw();
};

export const setCanvas = (canvasEl, videoEl, isRemote = false) => {
  canvasEl.width = videoEl.clientWidth;
  canvasEl.height = videoEl.clientHeight;
  videoEl.classList.add("hidden");
  canvasEl.classList.remove("hidden");
  renderCanvas(canvasEl, videoEl, isRemote);
};

export const handleUpdateFilter = (effect) => {
  canvasEffect = effect;
};

export const handleUpdateRemoteFilter = (effect) => {
  remoteCanvasEffect = effect;
};

export const renderFilterOptions = (selectEl) => {
  const filterTypes = [
    {
      type: "NO_FILTER",
      label: "No filter",
    },
    {
      type: "CANVAS_PIXELATE",
      label: "Pixelate",
    },
    {
      type: "CANVAS_INVERT",
      label: "Invert",
    },
  ];

  filterTypes.forEach(({ type, label }) => {
    const optionEl = document.createElement("option");
    optionEl.setAttribute("value", type);
    optionEl.textContent = label;
    selectEl.appendChild(optionEl);
  });
};
