export const generateSlug = (nombre) => {
  if (!nombre) return '';

  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const generateUniqueSlug = (nombre, existingSlugs = []) => {
  let baseSlug = generateSlug(nombre);
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return uniqueSlug;
};

const base64UrlEncode = (value = '') => {
  if (!value) return '';

  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(value, 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }

    if (typeof btoa === 'function') {
      return btoa(unescape(encodeURIComponent(value)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  } catch (error) {
    console.warn('base64UrlEncode error', error);
  }

  return value;
};

const base64UrlDecode = (value = '') => {
  if (!value) return '';

  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
  const padded = normalized + '='.repeat(padLength);

  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf-8');
    }

    if (typeof atob === 'function') {
      return decodeURIComponent(escape(atob(padded)));
    }
  } catch (error) {
    console.warn('base64UrlDecode error', error);
  }

  return '';
};

const isDirectFirebaseId = (value) => {
  if (!value) return false;
  const hyphenMatches = value.match(/-/g) || [];
  return hyphenMatches.length <= 1 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
};

const decodeIdFromSlugSegments = (segments, original) => {
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const joined = segments.slice(i).join('-');
    const decoded = base64UrlDecode(joined);
    if (decoded) {
      return decoded;
    }

    if (isDirectFirebaseId(joined)) {
      const hadDoubleHyphen = original.includes(`--${joined}`);
      if (hadDoubleHyphen && !joined.startsWith('-')) {
        return `-${joined}`;
      }
      return joined;
    }
  }

  return null;
};

export const getProductSlug = (producto = {}) => {

  if (!producto) {

    return '';

  }



  const id = producto.id || producto.productoId || producto._id || null;

  const baseNombre = producto.nombre ? generateSlug(producto.nombre) : '';

  const fallbackSlug = producto.slug || '';

  const baseSlug = baseNombre || fallbackSlug;



  if (!baseSlug) {

    return id ? base64UrlEncode(String(id)) : '';

  }



  if (!id) {

    return baseSlug;

  }



  const encodedId = base64UrlEncode(String(id));

  const normalizedBase = baseSlug.toLowerCase();



  if (encodedId && normalizedBase.endsWith(`-${encodedId.toLowerCase()}`)) {

    return baseSlug;

  }



  return `${baseSlug}-${encodedId}`;

};



export const extractIdFromSlug = (slug) => {
  if (!slug) return null;

  const normalized = String(slug).trim();

  if (isDirectFirebaseId(normalized)) {
    return normalized;
  }

  const segments = normalized.split('-').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  return decodeIdFromSlugSegments(segments, normalized);
};

export const createSlugWithId = (nombre, id) => {
  const baseSlug = generateSlug(nombre);
  if (!id) {
    return baseSlug;
  }

  const encodedId = base64UrlEncode(String(id));
  return `${baseSlug}-${encodedId}`;
};
