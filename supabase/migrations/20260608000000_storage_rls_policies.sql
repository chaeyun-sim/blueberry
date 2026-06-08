-- Storage RLS policies for arrangement-files and commission-images buckets.
-- Restricts all storage operations to authenticated users only,
-- and enforces server-side file size limits to prevent client-side bypass.

-- ──────────────────────────────────────────
-- Bucket configuration: enforce size limits
-- ──────────────────────────────────────────
UPDATE storage.buckets
SET
  file_size_limit = 52428800,  -- 50 MB (matches MAX_FILE_SIZE in client code)
  allowed_mime_types = ARRAY[
    'application/pdf',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/midi',
    'audio/x-midi',
    'application/octet-stream',  -- .mxl, .sib, .musx, .dorico, .ptx compressed formats
    'application/xml',
    'text/xml',
    'application/vnd.recordare.musicxml+xml',
    'application/vnd.recordare.musicxml'
  ]
WHERE id = 'arrangement-files';

UPDATE storage.buckets
SET
  file_size_limit = 10485760,  -- 10 MB for commission screenshot images
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
WHERE id = 'commission-images';

-- ──────────────────────────────────────────
-- arrangement-files: authenticated-only RLS
-- ──────────────────────────────────────────
CREATE POLICY "arrangement_files_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'arrangement-files');

CREATE POLICY "arrangement_files_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'arrangement-files');

CREATE POLICY "arrangement_files_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'arrangement-files');

CREATE POLICY "arrangement_files_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'arrangement-files');

-- ──────────────────────────────────────────
-- commission-images: authenticated-only RLS
-- ──────────────────────────────────────────
CREATE POLICY "commission_images_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'commission-images');

CREATE POLICY "commission_images_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'commission-images');

CREATE POLICY "commission_images_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'commission-images');

CREATE POLICY "commission_images_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'commission-images');
