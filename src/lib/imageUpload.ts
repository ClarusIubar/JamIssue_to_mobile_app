const MAX_UPLOAD_DIMENSION = 1600;
const MAX_UPLOAD_BYTES = 1_400_000;
const MAX_SOURCE_BYTES = 10_000_000;
const INITIAL_JPEG_QUALITY = 0.84;
const MIN_JPEG_QUALITY = 0.58;
const JPEG_QUALITY_STEP = 0.08;
const MIN_DIMENSION_AFTER_RESIZE = 960;

function replaceExtension(fileName: string, nextExtension: string) {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) {
    return `${fileName}.${nextExtension}`;
  }
  return `${fileName.slice(0, dotIndex)}.${nextExtension}`;
}

async function drawImageToCanvas(file: File) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('이미지를 읽지 못했어요.'));
      element.src = imageUrl;
    });

    const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('이미지 캔버스를 준비하지 못했어요.');
    }
    context.drawImage(image, 0, 0, width, height);
    return { canvas, width, height };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement, fileType: string, quality?: number) {
  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), fileType, quality);
  });
}

function shouldOptimizeImage(file: File) {
  return file.size > MAX_UPLOAD_BYTES || file.size > MAX_SOURCE_BYTES * 0.35;
}

async function compressCanvas(canvas: HTMLCanvasElement) {
  let quality = INITIAL_JPEG_QUALITY;
  let blob: Blob | null = null;

  while (quality >= MIN_JPEG_QUALITY) {
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (!blob) {
      return null;
    }
    if (blob.size <= MAX_UPLOAD_BYTES) {
      return blob;
    }
    quality -= JPEG_QUALITY_STEP;
  }

  return blob;
}

function shrinkCanvas(canvas: HTMLCanvasElement) {
  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = Math.max(MIN_DIMENSION_AFTER_RESIZE, Math.round(canvas.width * 0.75));
  resizedCanvas.height = Math.max(MIN_DIMENSION_AFTER_RESIZE, Math.round(canvas.height * 0.75));
  const context = resizedCanvas.getContext('2d');
  if (!context) {
    return null;
  }
  context.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
  return resizedCanvas;
}

export async function prepareReviewImageUpload(file: File) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }
  if (!file.type.startsWith('image/')) {
    return file;
  }
  if (!shouldOptimizeImage(file)) {
    return file;
  }

  try {
    const { canvas } = await drawImageToCanvas(file);
    let compressedBlob = await compressCanvas(canvas);

    if (!compressedBlob) {
      return file;
    }

    if (compressedBlob.size > MAX_UPLOAD_BYTES) {
      const resizedCanvas = shrinkCanvas(canvas);
      if (resizedCanvas) {
        const resizedBlob = await compressCanvas(resizedCanvas);
        if (resizedBlob) {
          compressedBlob = resizedBlob;
        }
      }
    }

    if (compressedBlob.size >= file.size && compressedBlob.size > MAX_UPLOAD_BYTES) {
      return file;
    }

    return new File([compressedBlob], replaceExtension(file.name, 'jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
