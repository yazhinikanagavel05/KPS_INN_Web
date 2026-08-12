const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_DIM = 1600;
const DEFAULT_QUALITY = 0.82;

export function validateImage(file) {
  if (!file) return { ok: false, error: 'No file selected.' };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Please choose a JPG, PNG, or WebP image.' };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: 'Image must be smaller than 5 MB.' };
  }
  return { ok: true };
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}

export function compressImage(dataUrl, maxDim = DEFAULT_MAX_DIM, quality = DEFAULT_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const mime = dataUrl.startsWith('data:image/png')
        ? 'image/png'
        : dataUrl.startsWith('data:image/webp')
          ? 'image/webp'
          : 'image/jpeg';
      resolve(canvas.toDataURL(mime, quality));
    };
    img.onerror = () => reject(new Error('Could not load the image.'));
    img.src = dataUrl;
  });
}

export async function processImage(file, opts) {
  const check = validateImage(file);
  if (!check.ok) return check;
  try {
    const dataUrl = await fileToDataUrl(file);
    const data = await compressImage(dataUrl, opts && opts.maxDim, opts && opts.quality);
    return { ok: true, data, name: file.name };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
