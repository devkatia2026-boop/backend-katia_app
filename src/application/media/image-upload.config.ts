export const IMAGE_UPLOAD_MAX_BYTES = 15 * 1024 * 1024;
export const INTRODUCTION_CONTENT_UPLOAD_MAX_BYTES = 100 * 1024 * 1024;
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

export type ImageUploadFieldConfig = Record<
  string,
  { maxCount: number; mimeTypes?: ReadonlySet<string> }
>;

export const DOCUMENT_UPLOAD_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

export const VIDEO_UPLOAD_MIME_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'video/mpeg',
]);

export const AUDIO_UPLOAD_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/aac',
  'audio/x-m4a',
]);

export const INTRODUCTION_CONTENT_UPLOAD_MIME_TYPES = new Set([
  ...IMAGE_UPLOAD_MIME_TYPES,
  ...DOCUMENT_UPLOAD_MIME_TYPES,
  ...VIDEO_UPLOAD_MIME_TYPES,
  ...AUDIO_UPLOAD_MIME_TYPES,
]);

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

export const PLAYLIST_IMAGE_FIELDS: ImageUploadFieldConfig = {
  photo: { maxCount: 1 },
};

export const WELL_IMAGE_FIELDS: ImageUploadFieldConfig = {
  photo: { maxCount: 1 },
  pdf: { maxCount: 1, mimeTypes: DOCUMENT_UPLOAD_MIME_TYPES },
};

export const EVOLUTION_IMAGE_FIELDS: ImageUploadFieldConfig = {
  original_photo: { maxCount: 1 },
  current_photo: { maxCount: 1 },
};

export const REVALUATION_IMAGE_FIELDS: ImageUploadFieldConfig = {
  front_photo: { maxCount: 1 },
  side_photo: { maxCount: 1 },
  back_photo: { maxCount: 1 },
};

export const S3_PREFIX_POST = 'posts';
export const S3_PREFIX_PROFILE = 'profiles';
export const S3_PREFIX_PROGRAM = 'programs';
export const S3_PREFIX_EVOLUTION = 'evolutions';
export const S3_PREFIX_REVALUATION = 'revaluations';
export const S3_PREFIX_COUPON = 'coupons';
export const S3_PREFIX_WELLBEING = 'wellbeing';
export const S3_PREFIX_WELL = 'wells';
export const S3_PREFIX_PLAYLIST = 'playlists';

export const INTRODUCTION_CONTENT_UPLOAD_FIELDS: ImageUploadFieldConfig = {
  link: { maxCount: 1, mimeTypes: INTRODUCTION_CONTENT_UPLOAD_MIME_TYPES },
};

export const S3_PREFIX_INTRODUCTION_CONTENT = 'introduction-contents';
