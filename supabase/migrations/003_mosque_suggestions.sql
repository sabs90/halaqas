CREATE TABLE mosque_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  suburb TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  suggested_by_contact TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
