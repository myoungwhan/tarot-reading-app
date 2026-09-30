const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeYoutubeSettings,
  toPublicYoutubeSettings,
} = require('../utils/youtubeSettings');

test('normalizes blank URLs and preserves independent enabled switches', () => {
  const settings = normalizeYoutubeSettings({
    consultant_youtube_url: '  https://example.com/consultant  ',
    consultant_youtube_enabled: 'true',
    querent_youtube_url: '',
    querent_youtube_enabled: false,
  });

  assert.deepEqual(settings, {
    consultant_youtube_url: 'https://example.com/consultant',
    consultant_youtube_enabled: true,
    querent_youtube_url: '',
    querent_youtube_enabled: false,
  });
});

test('rejects non-HTTPS URLs while accepting any HTTPS hostname', () => {
  assert.throws(
    () => normalizeYoutubeSettings({ consultant_youtube_url: 'http://example.com/video' }),
    /HTTPS URL/
  );

  assert.deepEqual(
    toPublicYoutubeSettings({
      consultant_youtube_url: 'https://not-youtube.example/video',
      consultant_youtube_enabled: true,
      querent_youtube_url: '',
      querent_youtube_enabled: true,
    }),
    {
      consultant: { url: 'https://not-youtube.example/video', enabled: true },
      querent: { url: '', enabled: true },
    }
  );
});

test('defaults missing settings to disabled links with blank URLs', () => {
  assert.deepEqual(toPublicYoutubeSettings(null), {
    consultant: { url: '', enabled: false },
    querent: { url: '', enabled: false },
  });
});
