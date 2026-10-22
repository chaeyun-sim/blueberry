-- Merge yearly sales rows that use a song's Korean and English catalog titles.
-- Keep a trailing key/version suffix as a drill-down variant.
CREATE OR REPLACE FUNCTION _stats_song_without_ost(p_title text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(regexp_replace(
    p_title,
    '[[:space:]]+[(][^()]*OST[^()]*[)][[:space:]]*$',
    '', 1, 1, 'i'
  ));
$$;

CREATE OR REPLACE FUNCTION _stats_song_base_title(p_title text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(regexp_replace(
    _stats_song_without_ost(p_title),
    '[[:space:]]+[(]?(in[[:space:]]+[A-G](#|b|♯|♭)?([[:space:]]+(major|minor))?|(easy|hard|pro)[[:space:]]+(version|ver[.]?))[)]?$',
    '', 1, 1, 'i'
  ));
$$;

CREATE OR REPLACE FUNCTION _stats_song_variant(p_title text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(COALESCE(
    (regexp_match(
      _stats_song_without_ost(p_title),
      '([[:space:]]+[(]?(in[[:space:]]+[A-G](#|b|♯|♭)?([[:space:]]+(major|minor))?|(easy|hard|pro)[[:space:]]+(version|ver[.]?))[)]?)$',
      'i'
    ))[1],
    ''
  ));
$$;

DROP FUNCTION IF EXISTS get_yearly_song_sales();

CREATE OR REPLACE FUNCTION get_yearly_song_sales()
RETURNS TABLE (
  year_num   int,
  song_title text,
  variant    text,
  sales      int
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  WITH parsed_sales AS (
    SELECT
      extract(year FROM s.sold_at)::int AS year_num,
      s.song_id,
      _stats_parse_song(s.product) AS parsed_title
    FROM sales AS s
    WHERE s.product IS NOT NULL
  ),
  canonical_sales AS (
    SELECT
      p.year_num,
      COALESCE(c.title, _stats_song_base_title(p.parsed_title)) AS song_title,
      _stats_song_variant(p.parsed_title) AS variant
    FROM parsed_sales AS p
    LEFT JOIN LATERAL (
      SELECT songs.title
      FROM songs
      WHERE songs.id = p.song_id
         OR lower(trim(songs.title)) = lower(_stats_song_base_title(p.parsed_title))
         OR (
           songs.english_title IS NOT NULL
           AND lower(trim(songs.english_title)) = lower(_stats_song_base_title(p.parsed_title))
         )
      ORDER BY
        CASE WHEN songs.id = p.song_id THEN 0 ELSE 1 END,
        CASE WHEN lower(trim(songs.title)) = lower(_stats_song_base_title(p.parsed_title)) THEN 0 ELSE 1 END,
        songs.created_at,
        songs.id
      LIMIT 1
    ) AS c ON true
    WHERE p.parsed_title IS NOT NULL
      AND p.parsed_title <> ''
  )
  SELECT
    year_num,
    song_title,
    variant,
    COUNT(*)::int AS sales
  FROM canonical_sales
  GROUP BY year_num, song_title, variant
  ORDER BY year_num DESC, sales DESC, song_title, variant;
$$;

GRANT EXECUTE ON FUNCTION _stats_song_base_title(text) TO authenticated;
GRANT EXECUTE ON FUNCTION _stats_song_variant(text) TO authenticated;
GRANT EXECUTE ON FUNCTION _stats_song_without_ost(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_yearly_song_sales() TO authenticated;
