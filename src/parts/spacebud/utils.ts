export const downloadPFP = async (
  budId: number,
  url: string,
  color?: string
) => {
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
  color ? ctx.translate(-304, -126) : ctx.translate(-341, -162);

  if (color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.rect(784 - 480, 606 - 480, 960, 960);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(784, 606, 443, 0, Math.PI * 2);
  ctx.clip();
  const img = await loadImage(url);
  ctx.drawImage(img, 0, 0, 1500, 1500);

  const tempCanvas = document.createElement("canvas"),
    tCtx = tempCanvas.getContext("2d");
  tempCanvas.width = color ? 960 : 886;
  tempCanvas.height = color ? 960 : 886;
  tCtx.drawImage(canvas, 0, 0);

  const png = tempCanvas.toDataURL("image/png");
  download(png, `SpaceBud${budId}pfp.png`);
};
