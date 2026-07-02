export const IMAGE_UPLOAD_MAX_BYTES = 15 * 1024 * 1024;
export const IMAGE_UPLOAD_MAX_FILES = 4;

export const IMAGE_UPLOAD_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

export type ImageUploadFieldConfig = Record<string, { maxCount: number }>;

export const POST_IMAGE_FIELDS: ImageUploadFieldConfig = {
  image: { maxCount: 1 },
};

export const PROFILE_IMAGE_FIELDS: ImageUploadFieldConfig = {
  photo_perfil: { maxCount: 1 },
};

export const PROGRAM_IMAGE_FIELDS: ImageUploadFieldConfig = {
  photo: { maxCount: 1 },
};

export const COUPON_IMAGE_FIELDS: ImageUploadFieldConfig = {
  photo: { maxCount: 1 },
};

export const WELLBEING_IMAGE_FIELDS: ImageUploadFieldConfig = {
  photo: { maxCount: 1 },
};

export const WELL_IMAGE_FIELDS: ImageUploadFieldConfig = {
  photo: { maxCount: 1 },
};

export const EVOLUTION_IMAGE_FIELDS: ImageUploadFieldConfig = {
  original_photo: { maxCount: 1 },
  current_photo: { maxCount: 1 },
};

export const S3_PREFIX_POST = 'posts';
export const S3_PREFIX_PROFILE = 'profiles';
export const S3_PREFIX_PROGRAM = 'programs';
export const S3_PREFIX_EVOLUTION = 'evolutions';
export const S3_PREFIX_COUPON = 'coupons';
export const S3_PREFIX_WELLBEING = 'wellbeing';
export const S3_PREFIX_WELL = 'wells';
