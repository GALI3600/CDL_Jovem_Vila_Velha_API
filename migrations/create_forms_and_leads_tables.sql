-- CDL Jovem Vila Velha API - Database Migration
-- Create forms and leads tables for multi-section WhatsApp campaign system
-- This migration adds new tables while preserving existing functionality

-- ==============================================
-- FORMS TABLE
-- ==============================================
-- Stores Google Forms information and metadata
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    google_form_id VARCHAR(255) UNIQUE,
    google_form_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster form lookups
CREATE INDEX IF NOT EXISTS idx_forms_google_form_id ON forms(google_form_id);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to forms table
DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;
CREATE TRIGGER update_forms_updated_at 
    BEFORE UPDATE ON forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- LEADS TABLE  
-- ==============================================
-- Stores lead information collected from Google Forms
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    responses JSONB DEFAULT '{}', -- Store complete form responses
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lead queries
CREATE INDEX IF NOT EXISTS idx_leads_form_id ON leads(form_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;

-- Add GIN index for JSONB responses for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_leads_responses_gin ON leads USING GIN (responses);

-- ==============================================
-- ROW LEVEL SECURITY (OPTIONAL)
-- ==============================================
-- Uncomment these if you want to enable RLS for additional security

-- Enable RLS on forms table
-- ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Enable RLS on leads table  
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies (example - adjust based on your authentication needs)
-- CREATE POLICY "Enable read access for all users" ON forms FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON forms FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON forms FOR UPDATE USING (true);
-- CREATE POLICY "Enable delete access for all users" ON forms FOR DELETE USING (true);

-- CREATE POLICY "Enable read access for all users" ON leads FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON leads FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON leads FOR UPDATE USING (true);
-- CREATE POLICY "Enable delete access for all users" ON leads FOR DELETE USING (true);

-- ==============================================
-- VALIDATION FUNCTIONS
-- ==============================================

-- Function to validate Brazilian phone numbers
CREATE OR REPLACE FUNCTION validate_brazilian_phone(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Remove all non-digit characters
    phone_number := regexp_replace(phone_number, '[^0-9]', '', 'g');
    
    -- Check if it's a valid Brazilian phone number
    -- Should be 10-13 digits (with or without country code 55)
    RETURN length(phone_number) BETWEEN 10 AND 13
           AND (phone_number ~ '^55[0-9]{10,11}$' OR phone_number ~ '^[0-9]{10,11}$');
END;
$$ LANGUAGE plpgsql;

-- Add check constraint for phone validation (optional)
-- ALTER TABLE leads ADD CONSTRAINT check_valid_phone 
--   CHECK (validate_brazilian_phone(phone));

-- ==============================================
-- USEFUL VIEWS
-- ==============================================

-- View to get forms with lead counts
CREATE OR REPLACE VIEW forms_with_lead_counts AS
SELECT 
    f.id,
    f.title,
    f.description,
    f.google_form_id,
    f.google_form_url,
    f.created_at,
    f.updated_at,
    COALESCE(l.lead_count, 0) as lead_count
FROM forms f
LEFT JOIN (
    SELECT form_id, COUNT(*) as lead_count
    FROM leads
    GROUP BY form_id
) l ON f.id = l.form_id;

-- View to get recent leads activity
CREATE OR REPLACE VIEW recent_leads_activity AS
SELECT 
    l.id,
    l.first_name,
    l.last_name,
    l.phone,
    l.email,
    l.created_at,
    f.title as form_title,
    f.id as form_id
FROM leads l
JOIN forms f ON l.form_id = f.id
ORDER BY l.created_at DESC
LIMIT 100;

-- ==============================================
-- SAMPLE DATA (OPTIONAL)
-- ==============================================
-- Uncomment to insert sample data for testing

-- INSERT INTO forms (title, description) VALUES
-- ('Cadastro de Interesse - CDL Jovem Vila Velha', 'Formulário para captura de leads interessados nos eventos da CDL Jovem'),
-- ('Newsletter Subscription', 'Inscrição para receber novidades da CDL Jovem Vila Velha');

-- ==============================================
-- MIGRATION COMPLETION MESSAGE
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE 'CDL Jovem Vila Velha API - Forms and Leads tables created successfully!';
    RAISE NOTICE 'Tables created: forms, leads';
    RAISE NOTICE 'Indexes created for optimal query performance';
    RAISE NOTICE 'Views created: forms_with_lead_counts, recent_leads_activity';
    RAISE NOTICE 'Migration completed at: %', NOW();
END $$;