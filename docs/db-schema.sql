-- =====================================================
-- RooMe Database Schema
-- =====================================================
-- This schema is designed for a React Native apartment rental/sharing app
-- Database: PostgreSQL (can be adapted to MySQL/SQL Server)
-- =====================================================

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Stores user account information
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Hashed password
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    profile_picture_url TEXT,
    gender CHAR(1), -- 'M', 'F', 'O' (Other), or NULL
    birth_date DATE,
    own_pet BOOLEAN DEFAULT FALSE,
    smoke BOOLEAN DEFAULT FALSE,
    job_status VARCHAR(255), -- e.g., "Student", "Engineer", etc.
    push_token TEXT, -- For push notifications
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_full_name ON users(full_name);

-- =====================================================
-- 2. PROPERTY TYPES TABLE
-- =====================================================
-- Lookup table for property types (e.g., Apartment, House, Studio)
CREATE TABLE property_types (
    property_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. APARTMENTS TABLE
-- =====================================================
-- Main apartment listings with three types:
-- ApartmentType: 0 = Rental, 1 = Shared, 2 = Sublet
CREATE TABLE apartments (
    apartment_id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    apartment_type SMALLINT NOT NULL CHECK (apartment_type IN (0, 1, 2)), -- 0=rental, 1=shared, 2=sublet
    property_type_id INTEGER REFERENCES property_types(property_type_id),
    
    -- Location (stored as JSON string in app, normalized here)
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Basic details
    price DECIMAL(10, 2) NOT NULL,
    amount_of_rooms DECIMAL(3, 1) NOT NULL, -- Supports half rooms (e.g., 3.5)
    floor INTEGER DEFAULT 0,
    description TEXT,
    
    -- Boolean features
    allow_pet BOOLEAN DEFAULT FALSE,
    allow_smoking BOOLEAN DEFAULT FALSE,
    parking_space INTEGER DEFAULT 0,
    
    -- Dates
    entry_date DATE NOT NULL,
    exit_date DATE, -- NULL for indefinite rentals
    
    -- Rental-specific fields (ApartmentType = 0)
    rental_contract_length INTEGER, -- Months, NULL if not applicable
    rental_extension_possible BOOLEAN DEFAULT FALSE,
    
    -- Shared-specific fields (ApartmentType = 1)
    shared_number_of_roommates INTEGER, -- NULL if not applicable
    
    -- Sublet-specific fields (ApartmentType = 2)
    sublet_can_cancel_without_penalty BOOLEAN DEFAULT FALSE,
    sublet_is_whole_property BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    num_of_likes INTEGER DEFAULT 0, -- Denormalized count for performance
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apartments_creator_id ON apartments(creator_id);
CREATE INDEX idx_apartments_apartment_type ON apartments(apartment_type);
CREATE INDEX idx_apartments_price ON apartments(price);
CREATE INDEX idx_apartments_entry_date ON apartments(entry_date);
CREATE INDEX idx_apartments_location ON apartments(latitude, longitude);
CREATE INDEX idx_apartments_is_active ON apartments(is_active);

-- =====================================================
-- 4. APARTMENT IMAGES TABLE
-- =====================================================
-- Images for apartments (one-to-many relationship)
CREATE TABLE apartment_images (
    image_id SERIAL PRIMARY KEY,
    apartment_id INTEGER NOT NULL REFERENCES apartments(apartment_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0, -- For ordering images
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apartment_images_apartment_id ON apartment_images(apartment_id);
CREATE INDEX idx_apartment_images_display_order ON apartment_images(apartment_id, display_order);

-- =====================================================
-- 5. APARTMENT LABELS TABLE
-- =====================================================
-- Lookup table for apartment amenities/features (e.g., "balcony", "elevator", "fridge")
CREATE TABLE apartment_labels (
    label_id SERIAL PRIMARY KEY,
    label_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., "balcony", "elevator"
    label_name_hebrew VARCHAR(255), -- Hebrew translation
    label_name_english VARCHAR(255), -- English translation
    icon_name VARCHAR(100), -- Icon identifier for UI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. APARTMENT_LABEL_JUNCTION TABLE
-- =====================================================
-- Many-to-many relationship between apartments and labels
CREATE TABLE apartment_label_junction (
    apartment_id INTEGER NOT NULL REFERENCES apartments(apartment_id) ON DELETE CASCADE,
    label_id INTEGER NOT NULL REFERENCES apartment_labels(label_id) ON DELETE CASCADE,
    PRIMARY KEY (apartment_id, label_id)
);

CREATE INDEX idx_apartment_label_junction_apartment ON apartment_label_junction(apartment_id);
CREATE INDEX idx_apartment_label_junction_label ON apartment_label_junction(label_id);

-- =====================================================
-- 7. SAVED APARTMENTS TABLE
-- =====================================================
-- Many-to-many relationship: Users can save apartments
CREATE TABLE saved_apartments (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    apartment_id INTEGER NOT NULL REFERENCES apartments(apartment_id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, apartment_id)
);

CREATE INDEX idx_saved_apartments_user_id ON saved_apartments(user_id);
CREATE INDEX idx_saved_apartments_apartment_id ON saved_apartments(apartment_id);

-- =====================================================
-- 8. ROOMMATES TABLE
-- =====================================================
-- Roommate information for shared apartments (ApartmentType = 1)
-- This stores roommate details that are displayed in shared apartment listings
CREATE TABLE roommates (
    roommate_id SERIAL PRIMARY KEY,
    apartment_id INTEGER NOT NULL REFERENCES apartments(apartment_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    gender CHAR(1), -- 'M', 'F', 'O'
    job VARCHAR(255),
    birth_date DATE,
    profile_image_url TEXT,
    display_order INTEGER DEFAULT 0, -- For ordering roommates in UI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roommates_apartment_id ON roommates(apartment_id);

-- =====================================================
-- 9. OPEN HOUSES TABLE
-- =====================================================
-- Open house events scheduled for apartments
CREATE TABLE open_houses (
    open_house_id SERIAL PRIMARY KEY,
    apartment_id INTEGER NOT NULL REFERENCES apartments(apartment_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location_address TEXT, -- Can override apartment address if different
    amount_of_people INTEGER NOT NULL DEFAULT 5, -- Maximum capacity
    total_registrations INTEGER DEFAULT 0, -- Denormalized count
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_open_houses_apartment_id ON open_houses(apartment_id);
CREATE INDEX idx_open_houses_date ON open_houses(date);

-- =====================================================
-- 10. OPEN HOUSE REGISTRATIONS TABLE
-- =====================================================
-- User registrations for open house events
CREATE TABLE open_house_registrations (
    registration_id SERIAL PRIMARY KEY,
    open_house_id INTEGER NOT NULL REFERENCES open_houses(open_house_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    confirmed BOOLEAN DEFAULT FALSE, -- Whether registration is confirmed
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (open_house_id, user_id) -- Prevent duplicate registrations
);

CREATE INDEX idx_open_house_registrations_open_house_id ON open_house_registrations(open_house_id);
CREATE INDEX idx_open_house_registrations_user_id ON open_house_registrations(user_id);

-- =====================================================
-- 11. FRIENDSHIPS TABLE
-- =====================================================
-- Many-to-many relationship: User friendships
-- Note: This is a symmetric relationship (if A is friend of B, B is friend of A)
CREATE TABLE friendships (
    friendship_id SERIAL PRIMARY KEY,
    user_id_1 INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    user_id_2 INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2) -- Prevent duplicate friendships (A-B and B-A)
);

CREATE INDEX idx_friendships_user_1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user_2 ON friendships(user_id_2);

-- =====================================================
-- 12. MESSAGES TABLE
-- =====================================================
-- Chat messages between users
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    to_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP
);

CREATE INDEX idx_messages_from_user ON messages(from_user_id);
CREATE INDEX idx_messages_to_user ON messages(to_user_id);
CREATE INDEX idx_messages_conversation ON messages(from_user_id, to_user_id, sent_at);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);

-- =====================================================
-- 13. ROOMMATE PREFERENCES TABLE
-- =====================================================
-- User preferences for finding compatible roommates
CREATE TABLE roommate_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Gender preference
    preferred_gender VARCHAR(50), -- e.g., "נשים בלבד", "גברים בלבד", "אין לי העדפה"
    
    -- Age preference
    preferred_min_age INTEGER DEFAULT 18,
    preferred_max_age INTEGER DEFAULT 99,
    
    -- Lifestyle preferences
    allow_smoking BOOLEAN,
    allow_pets BOOLEAN,
    cleanliness_level VARCHAR(100), -- e.g., "בכלל לא", "במידה סבירה", "חשוב לי ברמות!"
    sleep_schedule VARCHAR(50), -- e.g., "מוקדם", "מאוחר"
    social_level VARCHAR(255), -- e.g., "מעדיף את הבית שלי לעצמי"
    work_hours VARCHAR(100), -- e.g., "9 שעות", "12 שעות"
    work_from_home BOOLEAN,
    
    -- Personal info
    has_pet BOOLEAN DEFAULT FALSE,
    pet_type VARCHAR(100),
    relationship_status VARCHAR(100), -- e.g., "רווק/ה", "בזוגיות"
    social_style VARCHAR(255), -- e.g., "יוצא לבלות הרבה"
    open_to_friendship BOOLEAN,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roommate_preferences_user_id ON roommate_preferences(user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================
-- Auto-update updated_at timestamp on row updates

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apartments_updated_at BEFORE UPDATE ON apartments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_open_houses_updated_at BEFORE UPDATE ON open_houses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roommate_preferences_updated_at BEFORE UPDATE ON roommate_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS FOR DENORMALIZED COUNTS
-- =====================================================
-- Auto-update num_of_likes when saved_apartments changes

CREATE OR REPLACE FUNCTION update_apartment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE apartments 
        SET num_of_likes = num_of_likes + 1 
        WHERE apartment_id = NEW.apartment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE apartments 
        SET num_of_likes = GREATEST(0, num_of_likes - 1) 
        WHERE apartment_id = OLD.apartment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_apartment_likes_on_save
    AFTER INSERT OR DELETE ON saved_apartments
    FOR EACH ROW EXECUTE FUNCTION update_apartment_likes_count();

-- Auto-update total_registrations when open_house_registrations changes

CREATE OR REPLACE FUNCTION update_open_house_registrations_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE open_houses 
        SET total_registrations = total_registrations + 1 
        WHERE open_house_id = NEW.open_house_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE open_houses 
        SET total_registrations = GREATEST(0, total_registrations - 1) 
        WHERE open_house_id = OLD.open_house_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_open_house_registrations_on_change
    AFTER INSERT OR DELETE ON open_house_registrations
    FOR EACH ROW EXECUTE FUNCTION update_open_house_registrations_count();

-- =====================================================
-- RELATIONSHIP DIAGRAM SUMMARY
-- =====================================================
/*
Users (1) ──< (N) Apartments (creator_id)
Users (1) ──< (N) Messages (from_user_id, to_user_id)
Users (1) ──< (1) RoommatePreferences (user_id)
Users (N) ──< (M) SavedApartments ──> (N) Apartments
Users (N) ──< (M) Friendships ──> (N) Users
Users (N) ──< (M) OpenHouseRegistrations ──> (N) OpenHouses

Apartments (1) ──< (N) ApartmentImages
Apartments (1) ──< (N) Roommates
Apartments (1) ──< (N) OpenHouses
Apartments (N) ──< (M) ApartmentLabelJunction ──> (N) ApartmentLabels
Apartments (N) ──< (M) SavedApartments ──> (N) Users

PropertyTypes (1) ──< (N) Apartments

OpenHouses (1) ──< (N) OpenHouseRegistrations
OpenHouses (N) ──< (M) OpenHouseRegistrations ──> (N) Users
*/

