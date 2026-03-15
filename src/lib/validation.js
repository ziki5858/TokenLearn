const NAME_REGEX = /^[\p{L}\p{M}](?:[\p{L}\p{M}' -]{0,48}[\p{L}\p{M}])?$/u;
const PHONE_REGEX = /^\+?[0-9][0-9()\-\s]{5,19}$/;
const PHOTO_URL_REGEX = /^https?:\/\/[^\s<>]+$/i;
const HTML_DELIMITERS_REGEX = /[<>]/;

export const isValidName = (value) => NAME_REGEX.test(String(value || "").trim());

export const isValidPhone = (value) => PHONE_REGEX.test(String(value || "").trim());

export const normalizePhotoUrl = (value) => {
  const text = String(value || "").trim();
  return PHOTO_URL_REGEX.test(text) ? text : "";
};

export const isValidPhotoUrl = (value) => {
  const text = String(value || "").trim();
  return !text || normalizePhotoUrl(text) === text;
};

export const isSafeFreeText = (value, maxLength = 2000) => {
  if (value == null) return true;
  const text = String(value);
  return text.length <= maxLength && !HTML_DELIMITERS_REGEX.test(text);
};
