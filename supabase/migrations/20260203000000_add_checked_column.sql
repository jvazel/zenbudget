-- Add is_checked column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_checked BOOLEAN DEFAULT false;

-- Add index to improve performance for filtered queries
CREATE INDEX IF NOT EXISTS idx_transactions_is_checked ON transactions(is_checked);
