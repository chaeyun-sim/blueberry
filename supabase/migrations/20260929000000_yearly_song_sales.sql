-- Annual sales count by parsed work title for the Insights tab.
CREATE OR REPLACE FUNCTION get_yearly_song_sales()
RETURNS TABLE (
  year_num   int,
  song_title text,
  sales      int
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    extract(year FROM sold_at)::int AS year_num,
    _stats_parse_song(product) AS song_title,
    COUNT(*)::int AS sales
  FROM sales
  WHERE product IS NOT NULL
    AND _stats_parse_song(product) IS NOT NULL
    AND _stats_parse_song(product) <> ''
  GROUP BY year_num, song_title
  ORDER BY year_num DESC, sales DESC, song_title;
$$;

GRANT EXECUTE ON FUNCTION get_yearly_song_sales() TO authenticated;
