-- ================================================
-- Events, Speakers & Custom Blocks Schema
-- Run this in your Supabase SQL Editor AFTER 001_initial_schema.sql
-- ================================================

-- ================================================
-- EVENTS
-- ================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    cover_image TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    location_type VARCHAR(50) DEFAULT 'in_person', -- 'in_person', 'virtual', 'hybrid'
    venue_name VARCHAR(255),
    venue_address TEXT,
    virtual_url TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'cancelled', 'completed'
    registration_enabled BOOLEAN DEFAULT TRUE,
    max_attendees INTEGER,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    ticket_price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

-- ================================================
-- SPEAKERS
-- ================================================
CREATE TABLE speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    company VARCHAR(255),
    bio TEXT,
    short_bio VARCHAR(500),
    photo_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    website TEXT,
    social_links JSONB DEFAULT '{}', -- { twitter: "", linkedin: "", github: "" }
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- EVENT_SPEAKERS (Link speakers to events with session info)
-- ================================================
CREATE TABLE event_speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    speaker_id UUID REFERENCES speakers(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'speaker', -- 'keynote', 'speaker', 'panelist', 'moderator', 'host'
    session_title VARCHAR(255),
    session_description TEXT,
    session_start TIMESTAMP WITH TIME ZONE,
    session_end TIMESTAMP WITH TIME ZONE,
    session_room VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, speaker_id)
);

-- ================================================
-- EVENT_REGISTRATIONS
-- ================================================
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    job_title VARCHAR(255),
    ticket_type VARCHAR(100) DEFAULT 'general', -- 'general', 'vip', 'student', 'early_bird'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'attended'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
    amount_paid DECIMAL(10,2) DEFAULT 0,
    custom_fields JSONB DEFAULT '{}',
    confirmation_code VARCHAR(20),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE
);

-- ================================================
-- CUSTOM_BLOCKS (Reusable page builder blocks)
-- ================================================
CREATE TABLE custom_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Custom',
    content TEXT NOT NULL, -- HTML content
    css TEXT, -- Block styles
    preview_image TEXT,
    icon VARCHAR(100) DEFAULT 'rectangle', -- Icon name for block manager
    attributes JSONB DEFAULT '{}', -- Default attributes
    is_global BOOLEAN DEFAULT FALSE, -- Available to all tenants
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- EVENT_SCHEDULE (Detailed schedule/agenda)
-- ================================================
CREATE TABLE event_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    room VARCHAR(100),
    track VARCHAR(100), -- For multi-track conferences
    type VARCHAR(50) DEFAULT 'session', -- 'session', 'break', 'networking', 'keynote'
    speaker_ids UUID[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_events_tenant_id ON events(tenant_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_speakers_tenant_id ON speakers(tenant_id);
CREATE INDEX idx_event_speakers_event_id ON event_speakers(event_id);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_email ON event_registrations(email);
CREATE INDEX idx_custom_blocks_tenant_id ON custom_blocks(tenant_id);
CREATE INDEX idx_event_schedule_event_id ON event_schedule(event_id);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_schedule ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Users can view tenant events" ON events
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage tenant events" ON events
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Public events (for public pages)
CREATE POLICY "Public can view published events" ON events
    FOR SELECT USING (status = 'published');

-- Speakers policies
CREATE POLICY "Users can view tenant speakers" ON speakers
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage tenant speakers" ON speakers
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Event speakers policies
CREATE POLICY "Anyone can view event speakers" ON event_speakers
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage event speakers" ON event_speakers
    FOR ALL USING (
        event_id IN (
            SELECT id FROM events WHERE tenant_id IN (
                SELECT tenant_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Registrations policies
CREATE POLICY "Users can view event registrations" ON event_registrations
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM events WHERE tenant_id IN (
                SELECT tenant_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Anyone can register for events" ON event_registrations
    FOR INSERT WITH CHECK (TRUE);

-- Custom blocks policies
CREATE POLICY "Users can view tenant blocks" ON custom_blocks
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
        OR is_global = TRUE
    );

CREATE POLICY "Users can manage tenant blocks" ON custom_blocks
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Schedule policies
CREATE POLICY "Anyone can view event schedule" ON event_schedule
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage event schedule" ON event_schedule
    FOR ALL USING (
        event_id IN (
            SELECT id FROM events WHERE tenant_id IN (
                SELECT tenant_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- ================================================
-- TRIGGERS
-- ================================================
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_speakers_updated_at
    BEFORE UPDATE ON speakers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_custom_blocks_updated_at
    BEFORE UPDATE ON custom_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- FUNCTIONS
-- ================================================

-- Generate unique confirmation code for registrations
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.confirmation_code = UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registration_confirmation_code
    BEFORE INSERT ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION generate_confirmation_code();
