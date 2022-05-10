export const downloadPFP = async (budId: number, url: string) => {
  const download = (dataurl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataurl;
    link.download = filename;
    link.click();
  };

  const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((res) => {
      const img = new window.Image();
      img.src = url;
      img.crossOrigin = "anonymous";
      img.onload = () => res(img);
    });
  const canvas = document.createElement("canvas");
  canvas.height = 1500;
  canvas.width = 1500;

  const ctx = canvas.getContext("2d");
  ctx.translate(-341, -163);
  // not relevant right now, but in case we want a border around the image we can do it with this arc
  // ctx.beginPath();
  // ctx.fillStyle = theme.colors.primary;
  // ctx.arc(784, 606, 443, 0, Math.PI * 2);
  // ctx.fill();
  ctx.beginPath();
  ctx.arc(784, 606, 443, 0, Math.PI * 2);
  ctx.clip();
  const img = await loadImage(url);
  ctx.drawImage(img, 0, 0, 1500, 1500);

  const tempCanvas = document.createElement("canvas"),
    tCtx = tempCanvas.getContext("2d");
  tempCanvas.width = 886;
  tempCanvas.height = 886;
  tCtx.drawImage(canvas, 0, 0);

  const png = tempCanvas.toDataURL("image/png");
  download(png, `SpaceBud${budId}pfp.png`);
};
