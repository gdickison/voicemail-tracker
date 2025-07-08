-- Voicemail Tracker Database Schema
-- Run this script to create the necessary tables

-- Create voicemails table
CREATE TABLE IF NOT EXISTS voicemails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_name TEXT NOT NULL,
    to_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    message_content TEXT NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken_by TEXT NOT NULL,
    returned BOOLEAN DEFAULT FALSE,
    returned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voicemails_returned ON voicemails(returned);
CREATE INDEX IF NOT EXISTS idx_voicemails_date_time ON voicemails(date_time);
CREATE INDEX IF NOT EXISTS idx_voicemails_created_at ON voicemails(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_voicemails_updated_at 
    BEFORE UPDATE ON voicemails 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE voicemails IS 'Stores voicemail messages with all details';
COMMENT ON COLUMN voicemails.returned IS 'Whether the voicemail has been returned/called back';
COMMENT ON COLUMN voicemails.returned_at IS 'Timestamp when the voicemail was marked as returned'; 