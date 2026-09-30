const DEFAULT_YOUTUBE_SETTINGS = {
  consultant_youtube_url: '',
  consultant_youtube_enabled: false,
  querent_youtube_url: '',
  querent_youtube_enabled: false,
};

const parseBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1';

const normalizeUrl = (value) => {
  const url = typeof value === 'string' ? value.trim() : '';
  if (!url) return '';

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('URL must be a valid HTTPS URL');
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new Error('URL must be a valid HTTPS URL');
  }

  return url;
};

const normalizeYoutubeSettings = (input = {}) => ({
  consultant_youtube_url: normalizeUrl(input.consultant_youtube_url),
  consultant_youtube_enabled: parseBoolean(input.consultant_youtube_enabled),
  querent_youtube_url: normalizeUrl(input.querent_youtube_url),
  querent_youtube_enabled: parseBoolean(input.querent_youtube_enabled),
});

const toPublicYoutubeSettings = (settings) => {
  const normalized = settings
    ? normalizeYoutubeSettings(settings)
    : DEFAULT_YOUTUBE_SETTINGS;

  return {
    consultant: {
      url: normalized.consultant_youtube_url,
      enabled: normalized.consultant_youtube_enabled,
    },
    querent: {
      url: normalized.querent_youtube_url,
      enabled: normalized.querent_youtube_enabled,
    },
  };
};

module.exports = {
  DEFAULT_YOUTUBE_SETTINGS,
  normalizeYoutubeSettings,
  toPublicYoutubeSettings,
};
