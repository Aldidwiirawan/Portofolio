-- ==============================================================================
-- MIGRATION: GUESTBOOK (Buku Tamu Publik)
-- Timestamp: 2026-10-08T21:05:00Z
-- ==============================================================================

CREATE TABLE IF NOT EXISTS guestbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  avatar_color VARCHAR(30) DEFAULT '#38bdf8',
  is_pinned BOOLEAN DEFAULT false,
  admin_reply TEXT,
  admin_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE guestbooks ENABLE ROW LEVEL SECURITY;

-- 1. Public can read all guestbook entries
DROP POLICY IF EXISTS "Allow public read access on guestbooks" ON guestbooks;
CREATE POLICY "Allow public read access on guestbooks"
  ON guestbooks FOR SELECT
  USING (true);

-- 2. Public can insert new guestbook entry (leave a note)
DROP POLICY IF EXISTS "Allow public insert on guestbooks" ON guestbooks;
CREATE POLICY "Allow public insert on guestbooks"
  ON guestbooks FOR INSERT
  WITH CHECK (true);

-- 3. Only authenticated admin can update entries (reply or pin message)
DROP POLICY IF EXISTS "Allow authenticated update on guestbooks" ON guestbooks;
CREATE POLICY "Allow authenticated update on guestbooks"
  ON guestbooks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Only authenticated admin can delete entries
DROP POLICY IF EXISTS "Allow authenticated delete on guestbooks" ON guestbooks;
CREATE POLICY "Allow authenticated delete on guestbooks"
  ON guestbooks FOR DELETE
  TO authenticated
  USING (true);

-- Initial seed sample entries to warm up the guestbook
INSERT INTO guestbooks (name, message, avatar_color, is_pinned, admin_reply, admin_reply_at, created_at)
VALUES 
  (
    'Duta Fithra Qolby',
    'Keren banget websitenya bang! Desain dan animasinya sangat modern dan rapi 🔥',
    '#38bdf8',
    true,
    'Makasih banyak sudah mampir dan ninggalin jejak bang! 🙌 Sukses selalu.',
    now() - interval '1 hour',
    now() - interval '2 days'
  ),
  (
    'Priscilla Leza',
    'Suka banget sama visual card dan detail portofolionya, keliatan niat banget dibuatnya!',
    '#34d399',
    false,
    'Terima kasih banyak ya! Senang bisa bermanfaat ✨',
    now() - interval '30 minutes',
    now() - interval '1 day'
  )
ON CONFLICT DO NOTHING;
