-- ============================================================
-- Stats Aggregation RPC Functions
-- Replaces client-side aggregation over MAX_ROWS=100,000 rows
-- with server-side PostgreSQL aggregation.
--
-- HOW TO APPLY:
--   Option A) Supabase dashboard → SQL Editor → paste & run
--   Option B) supabase db push (if supabase CLI is configured)
-- ============================================================

-- ─── Product Name Parsing Helpers ────────────────────────────
-- Replicates the client-side splitProduct() logic in SQL.
-- product format: "곡명 - 편성명" (split at last dash)

CREATE OR REPLACE FUNCTION _stats_clean_product(p_product text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_product ~ '님[[:space:]]*개인결제용'
    THEN trim(regexp_replace(p_product, '^.*님[[:space:]]*개인결제용[[:space:]]*', ''))
    ELSE p_product
  END;
$$;

CREATE OR REPLACE FUNCTION _stats_parse_song(p_product text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cleaned  text;
  last_pos int;
BEGIN
  IF p_product IS NULL THEN RETURN NULL; END IF;
  cleaned  := _stats_clean_product(p_product);
  last_pos := length(cleaned) - strpos(reverse(cleaned), '-') + 1;
  IF strpos(cleaned, '-') = 0 THEN
    RETURN trim(cleaned);
  END IF;
  RETURN trim(left(cleaned, last_pos - 1));
END;
$$;

CREATE OR REPLACE FUNCTION _stats_parse_arrangement(p_product text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cleaned text;
BEGIN
  IF p_product IS NULL THEN RETURN ''; END IF;
  cleaned := _stats_clean_product(p_product);
  IF strpos(cleaned, '-') = 0 THEN RETURN ''; END IF;
  RETURN trim(right(cleaned, strpos(reverse(cleaned), '-') - 1));
END;
$$;

-- ─── get_sales_summary ──────────────────────────────────────
-- Replaces 6 parallel .limit(100_000) queries with one pass.
-- Returns JSON with all summary metrics.

CREATE OR REPLACE FUNCTION get_sales_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_y   int := extract(year  FROM now())::int;
  v_m   int := extract(month FROM now())::int;
  v_pm  int := CASE WHEN v_m  = 1 THEN 12       ELSE v_m  - 1 END;
  v_pmy int := CASE WHEN v_m  = 1 THEN v_y - 1  ELSE v_y      END;
  v_ppm int := CASE WHEN v_pm = 1 THEN 12       ELSE v_pm - 1 END;
  v_ppmy int:= CASE WHEN v_pm = 1 THEN v_pmy - 1 ELSE v_pmy    END;
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalRevenue',     COALESCE(SUM(amount), 0),
      'totalCount',       COUNT(*),
      'thisYearRevenue',  COALESCE(SUM(amount)  FILTER (WHERE extract(year  FROM sold_at) = v_y),                                                      0),
      'thisYearCount',    COUNT(*)               FILTER (WHERE extract(year  FROM sold_at) = v_y),
      'lastYearRevenue',  COALESCE(SUM(amount)  FILTER (WHERE extract(year  FROM sold_at) = v_y - 1),                                                  0),
      'lastYearCount',    COUNT(*)               FILTER (WHERE extract(year  FROM sold_at) = v_y - 1),
      'thisMonthCount',   COUNT(*)               FILTER (WHERE extract(year  FROM sold_at) = v_y   AND extract(month FROM sold_at) = v_m),
      'lastMonthRevenue', COALESCE(SUM(amount)  FILTER (WHERE extract(year  FROM sold_at) = v_pmy  AND extract(month FROM sold_at) = v_pm),             0),
      'lastMonthCount',   COUNT(*)               FILTER (WHERE extract(year  FROM sold_at) = v_pmy  AND extract(month FROM sold_at) = v_pm),
      'prevPrevRevenue',  COALESCE(SUM(amount)  FILTER (WHERE extract(year  FROM sold_at) = v_ppmy AND extract(month FROM sold_at) = v_ppm),            0),
      'prevPrevCount',    COUNT(*)               FILTER (WHERE extract(year  FROM sold_at) = v_ppmy AND extract(month FROM sold_at) = v_ppm)
    )
    FROM sales
  );
END;
$$;

-- ─── get_monthly_sales ──────────────────────────────────────
-- Replaces 2 full-table queries. Returns 12 rows (one per month).

CREATE OR REPLACE FUNCTION get_monthly_sales(p_year int)
RETURNS TABLE (
  month_num    int,
  revenue      bigint,
  count        int,
  prev_revenue bigint,
  prev_count   int
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    m.n AS month_num,
    COALESCE(SUM(amount) FILTER (WHERE extract(year FROM sold_at) = p_year),       0)::bigint AS revenue,
    COUNT(*)             FILTER (WHERE extract(year FROM sold_at) = p_year)::int              AS count,
    COALESCE(SUM(amount) FILTER (WHERE extract(year FROM sold_at) = p_year - 1),   0)::bigint AS prev_revenue,
    COUNT(*)             FILTER (WHERE extract(year FROM sold_at) = p_year - 1)::int          AS prev_count
  FROM generate_series(1, 12) AS m(n)
  LEFT JOIN sales s
    ON extract(month FROM s.sold_at) = m.n
   AND extract(year  FROM s.sold_at) IN (p_year, p_year - 1)
  GROUP BY m.n
  ORDER BY m.n;
$$;

-- ─── get_monthly_category_breakdown ─────────────────────────
-- Replaces one full-table query. Returns 12 rows.

CREATE OR REPLACE FUNCTION get_monthly_category_breakdown(p_year int)
RETURNS TABLE (
  month_num int,
  "CLASSIC"  bigint,
  "POP"      bigint,
  "K-POP"    bigint,
  "OST"      bigint,
  "ANI"      bigint,
  "ETC"      bigint
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    m.n AS month_num,
    COALESCE(SUM(amount) FILTER (WHERE cat = 'CLASSIC'), 0)::bigint,
    COALESCE(SUM(amount) FILTER (WHERE cat = 'POP'),     0)::bigint,
    COALESCE(SUM(amount) FILTER (WHERE cat = 'K-POP'),   0)::bigint,
    COALESCE(SUM(amount) FILTER (WHERE cat = 'OST'),     0)::bigint,
    COALESCE(SUM(amount) FILTER (WHERE cat = 'ANI'),     0)::bigint,
    COALESCE(SUM(amount) FILTER (WHERE cat = 'ETC'),     0)::bigint
  FROM generate_series(1, 12) AS m(n)
  LEFT JOIN (
    SELECT
      extract(month FROM sold_at)::int AS month_num,
      amount,
      CASE WHEN category IN ('CLASSIC','POP','K-POP','OST','ANI','ETC')
           THEN category ELSE 'ETC' END AS cat
    FROM sales
    WHERE extract(year FROM sold_at) = p_year
  ) s ON s.month_num = m.n
  GROUP BY m.n
  ORDER BY m.n;
$$;

-- ─── get_category_distribution ──────────────────────────────
-- Replaces one full-table query. p_year = NULL → all time.

CREATE OR REPLACE FUNCTION get_category_distribution(p_year int DEFAULT NULL)
RETURNS TABLE (
  name    text,
  revenue bigint,
  count   int
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    CASE WHEN category IN ('CLASSIC','POP','K-POP','OST','ANI','ETC')
         THEN category ELSE 'ETC' END AS name,
    SUM(amount)::bigint AS revenue,
    COUNT(*)::int       AS count
  FROM sales
  WHERE (p_year IS NULL OR extract(year FROM sold_at) = p_year)
  GROUP BY name;
$$;

-- ─── get_top_songs ──────────────────────────────────────────
-- Replaces one full-table query. Returns top N songs by sales.

CREATE OR REPLACE FUNCTION get_top_songs(p_top_n int DEFAULT 5)
RETURNS TABLE (
  song_title text,
  category   text,
  sales      int,
  revenue    bigint
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    parsed.song_title,
    parsed.cat AS category,
    COUNT(*)::int       AS sales,
    SUM(parsed.amount)::bigint AS revenue
  FROM (
    SELECT
      _stats_parse_song(product) AS song_title,
      CASE WHEN category IN ('CLASSIC','POP','K-POP','OST','ANI','ETC')
           THEN category ELSE 'ETC' END AS cat,
      amount
    FROM sales
    WHERE product IS NOT NULL
  ) parsed
  WHERE parsed.song_title IS NOT NULL AND parsed.song_title <> ''
  GROUP BY parsed.song_title, parsed.cat
  ORDER BY sales DESC
  LIMIT p_top_n;
$$;

-- ─── get_top_arrangements ───────────────────────────────────
-- Replaces one full-table query. Returns top N arrangements.

CREATE OR REPLACE FUNCTION get_top_arrangements(p_top_n int DEFAULT 5)
RETURNS TABLE (
  arrangement text,
  sales       int,
  revenue     bigint
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    _stats_parse_arrangement(product) AS arrangement,
    COUNT(*)::int       AS sales,
    SUM(amount)::bigint AS revenue
  FROM sales
  WHERE product IS NOT NULL
    AND _stats_parse_arrangement(product) <> ''
  GROUP BY arrangement
  ORDER BY sales DESC
  LIMIT p_top_n;
$$;

-- ─── get_top_song_monthly_sales ─────────────────────────────
-- Replaces one full-table query. Returns (month, song, count, rank)
-- rows — only top-N songs, only 12 months. TypeScript reconstructs
-- the pivot structure without fetching raw rows.

CREATE OR REPLACE FUNCTION get_top_song_monthly_sales(p_year int, p_top_n int DEFAULT 5)
RETURNS TABLE (
  month_num  int,
  song_title text,
  count      int,
  song_rank  int
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  WITH top_songs AS (
    SELECT
      _stats_parse_song(product) AS song_title,
      row_number() OVER (ORDER BY COUNT(*) DESC)::int AS song_rank
    FROM sales
    WHERE extract(year FROM sold_at) = p_year
      AND product IS NOT NULL
      AND _stats_parse_song(product) <> ''
    GROUP BY _stats_parse_song(product)
    LIMIT p_top_n
  )
  SELECT
    extract(month FROM s.sold_at)::int AS month_num,
    ts.song_title,
    COUNT(*)::int AS count,
    ts.song_rank
  FROM sales s
  JOIN top_songs ts ON _stats_parse_song(s.product) = ts.song_title
  WHERE extract(year FROM s.sold_at) = p_year
    AND s.product IS NOT NULL
  GROUP BY month_num, ts.song_title, ts.song_rank
  ORDER BY ts.song_rank, month_num;
$$;

-- ─── get_seasonal_pattern ───────────────────────────────────
-- Replaces one full-table query. Returns 12 rows (one per month)
-- with total revenue, count, year count, and top 5 songs as JSON.

CREATE OR REPLACE FUNCTION get_seasonal_pattern()
RETURNS TABLE (
  month_num   int,
  avg_revenue bigint,
  avg_count   int,
  years       int,
  top_songs   json
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  WITH monthly_yearly AS (
    SELECT
      extract(month FROM sold_at)::int AS month_num,
      extract(year  FROM sold_at)::int AS year_num,
      SUM(amount)::bigint              AS revenue,
      COUNT(*)::int                    AS cnt
    FROM sales
    GROUP BY month_num, year_num
  ),
  monthly_totals AS (
    SELECT
      month_num,
      SUM(revenue)::bigint AS total_revenue,
      SUM(cnt)::int        AS total_count,
      COUNT(*)::int        AS years
    FROM monthly_yearly
    GROUP BY month_num
  ),
  song_counts AS (
    SELECT
      extract(month FROM sold_at)::int AS month_num,
      _stats_parse_song(product)       AS song_title,
      COUNT(*)::int                    AS cnt
    FROM sales
    WHERE product IS NOT NULL
      AND _stats_parse_song(product) <> ''
    GROUP BY month_num, song_title
  ),
  top_songs_per_month AS (
    SELECT
      month_num,
      json_agg(
        json_build_object('title', song_title, 'avgCount', cnt)
        ORDER BY cnt DESC
      ) AS songs
    FROM (
      SELECT
        month_num, song_title, cnt,
        row_number() OVER (PARTITION BY month_num ORDER BY cnt DESC) AS rn
      FROM song_counts
    ) ranked
    WHERE rn <= 5
    GROUP BY month_num
  )
  SELECT
    m.n                                          AS month_num,
    COALESCE(mt.total_revenue, 0)                AS avg_revenue,
    COALESCE(mt.total_count, 0)                  AS avg_count,
    COALESCE(mt.years, 0)                        AS years,
    COALESCE(ts.songs, '[]'::json)               AS top_songs
  FROM generate_series(1, 12) AS m(n)
  LEFT JOIN monthly_totals mt      ON mt.month_num = m.n
  LEFT JOIN top_songs_per_month ts ON ts.month_num = m.n
  ORDER BY m.n;
$$;

-- ─── get_trending_songs ─────────────────────────────────────
-- Replaces one 6-month full-table query. Returns trending songs.

CREATE OR REPLACE FUNCTION get_trending_songs()
RETURNS TABLE (
  title        text,
  recent_sales int,
  prev_sales   int,
  growth       numeric
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  WITH boundaries AS (
    SELECT
      (now() - interval '6 months')::date AS six_months_ago,
      (now() - interval '3 months')::date AS three_months_ago
  ),
  period_counts AS (
    SELECT
      _stats_parse_song(product) AS title,
      COUNT(*) FILTER (WHERE sold_at::date >= (SELECT three_months_ago FROM boundaries))::int AS recent,
      COUNT(*) FILTER (WHERE sold_at::date <  (SELECT three_months_ago FROM boundaries))::int AS prev
    FROM sales
    WHERE sold_at::date >= (SELECT six_months_ago FROM boundaries)
      AND product IS NOT NULL
      AND _stats_parse_song(product) <> ''
    GROUP BY title
  )
  SELECT
    title,
    recent AS recent_sales,
    prev   AS prev_sales,
    round((((recent - prev)::numeric / prev) * 100), 1) AS growth
  FROM period_counts
  WHERE recent >= 3
    AND prev   >= 1
    AND abs(recent - prev) > 1
  ORDER BY growth DESC;
$$;

-- ─── get_revenue_concentration ──────────────────────────────
-- Replaces one full-table query. Returns pareto analysis rows.

CREATE OR REPLACE FUNCTION get_revenue_concentration()
RETURNS TABLE (
  rank             int,
  title            text,
  revenue          bigint,
  revenue_share    numeric,
  cumulative_share numeric,
  song_share       numeric
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  WITH song_revenue AS (
    SELECT
      _stats_parse_song(product) AS title,
      SUM(amount)::bigint        AS revenue
    FROM sales
    WHERE product IS NOT NULL
      AND _stats_parse_song(product) <> ''
    GROUP BY title
  ),
  total AS (
    SELECT SUM(revenue) AS grand_total, COUNT(*) AS total_songs FROM song_revenue
  ),
  ranked AS (
    SELECT
      row_number() OVER (ORDER BY revenue DESC)::int AS rank,
      title,
      revenue,
      SUM(revenue) OVER (ORDER BY revenue DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative
    FROM song_revenue
  )
  SELECT
    r.rank,
    r.title,
    r.revenue,
    round((r.revenue::numeric  / t.grand_total * 100), 2) AS revenue_share,
    round((r.cumulative::numeric / t.grand_total * 100), 2) AS cumulative_share,
    round((r.rank::numeric     / t.total_songs  * 100), 1) AS song_share
  FROM ranked r
  CROSS JOIN total t
  WHERE t.grand_total > 0
  ORDER BY r.rank;
$$;

-- ─── Permissions ─────────────────────────────────────────────
-- Grant EXECUTE to the authenticated role so supabase.rpc() works.

GRANT EXECUTE ON FUNCTION _stats_clean_product(text)                        TO authenticated;
GRANT EXECUTE ON FUNCTION _stats_parse_song(text)                            TO authenticated;
GRANT EXECUTE ON FUNCTION _stats_parse_arrangement(text)                     TO authenticated;
GRANT EXECUTE ON FUNCTION get_sales_summary()                                TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_sales(int)                             TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_category_breakdown(int)                TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_distribution(int)                     TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_songs(int)                                 TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_arrangements(int)                          TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_song_monthly_sales(int, int)               TO authenticated;
GRANT EXECUTE ON FUNCTION get_seasonal_pattern()                             TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_songs()                               TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_concentration()                        TO authenticated;
