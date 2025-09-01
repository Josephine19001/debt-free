-- Create daily supplement tracking system
-- This replaces the old supplement_logs table with a proper daily tracking system

-- Create the daily supplement entries table
CREATE TABLE IF NOT EXISTS daily_supplement_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    supplement_id UUID REFERENCES user_supplements(id) ON DELETE CASCADE NOT NULL,
    supplement_name TEXT NOT NULL, -- Denormalized for easier querying
    date DATE NOT NULL, -- The date this entry is for (YYYY-MM-DD)
    taken BOOLEAN DEFAULT FALSE NOT NULL, -- Whether the supplement was taken
    time_taken TIME, -- What time it was taken (if taken)
    dosage_taken TEXT, -- Actual dosage taken (might differ from default)
    notes TEXT, -- Optional notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one entry per user/supplement/date combination
    UNIQUE(user_id, supplement_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_supplement_entries_user_date 
    ON daily_supplement_entries(user_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_supplement_entries_supplement_date 
    ON daily_supplement_entries(supplement_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_supplement_entries_user_supplement 
    ON daily_supplement_entries(user_id, supplement_id);

-- Enable RLS
ALTER TABLE daily_supplement_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own supplement entries" 
    ON daily_supplement_entries FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplement entries" 
    ON daily_supplement_entries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement entries" 
    ON daily_supplement_entries FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement entries" 
    ON daily_supplement_entries FOR DELETE 
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_supplement_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_daily_supplement_entries_updated_at_trigger
    BEFORE UPDATE ON daily_supplement_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_supplement_entries_updated_at();

-- Grant permissions
GRANT ALL ON daily_supplement_entries TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a function to get daily supplement status
CREATE OR REPLACE FUNCTION get_daily_supplement_status(
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    supplement_id UUID,
    supplement_name TEXT,
    default_dosage TEXT,
    frequency TEXT,
    importance TEXT,
    taken BOOLEAN,
    time_taken TIME,
    dosage_taken TEXT,
    notes TEXT,
    scheduled BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.id as supplement_id,
        us.name as supplement_name,
        us.default_dosage,
        us.frequency,
        us.importance,
        COALESCE(dse.taken, FALSE) as taken,
        dse.time_taken,
        dse.dosage_taken,
        dse.notes,
        CASE 
            WHEN us.frequency = 'Daily' THEN TRUE
            WHEN EXTRACT(DOW FROM target_date)::TEXT = ANY(us.days_of_week) THEN TRUE
            ELSE FALSE
        END as scheduled
    FROM user_supplements us
    LEFT JOIN daily_supplement_entries dse ON (
        us.id = dse.supplement_id 
        AND dse.date = target_date
        AND dse.user_id = auth.uid()
    )
    WHERE us.user_id = auth.uid() 
    AND us.is_active = TRUE
    AND (
        us.frequency = 'Daily' 
        OR EXTRACT(DOW FROM target_date)::TEXT = ANY(us.days_of_week)
    )
    ORDER BY us.importance DESC, us.name ASC;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_daily_supplement_status(DATE) TO authenticated;

-- Create a view for easier querying
CREATE OR REPLACE VIEW daily_supplement_status AS
SELECT * FROM get_daily_supplement_status(CURRENT_DATE);

-- Grant permissions on the view
GRANT SELECT ON daily_supplement_status TO authenticated;
