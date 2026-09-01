-- db/schema.sql - UPDATED VERSION
-- Drop existing tables if needed (BE CAREFUL!)
-- DROP TABLE IF EXISTS exchange_rates;
-- DROP TABLE IF EXISTS admin_sessions;
-- DROP TABLE IF EXISTS site_config;
-- DROP TABLE IF EXISTS admin;

-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY DEFAULT 1,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create site_config table with margin fields
CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    shipping_cost INTEGER NOT NULL DEFAULT 3500,
    shipping_to_pristina INTEGER NOT NULL DEFAULT 350,
    default_margin_percentage INTEGER NOT NULL DEFAULT 15,
    default_minimum_margin INTEGER NOT NULL DEFAULT 1000,
    krw_to_eur_rate NUMERIC NOT NULL DEFAULT 0.000628,
    contact_email VARCHAR(255) NOT NULL DEFAULT 'blerart@outlook.com',
    contact_phone VARCHAR(50) NOT NULL DEFAULT '+383 49 195 414',
    site_name VARCHAR(100) NOT NULL DEFAULT 'Vetura Korea Kosova',
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    vehicle_types JSONB NOT NULL DEFAULT '{
        "suv": {"shippingCost": 4500, "marginPercentage": 18, "minimumMargin": 1500, "enabled": true},
        "sedan": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1000, "enabled": true},
        "hatchback": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1000, "enabled": true},
        "wagon": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1000, "enabled": true},
        "coupe": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1000, "enabled": true},
        "van": {"shippingCost": 3800, "marginPercentage": 12, "minimumMargin": 800, "enabled": true},
        "pickup": {"shippingCost": 4000, "marginPercentage": 12, "minimumMargin": 800, "enabled": true},
        "sport_car": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1500, "enabled": true},
        "default": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1000, "enabled": true}
    }',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES admin(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
    id INTEGER PRIMARY KEY DEFAULT 1,
    rates JSONB NOT NULL DEFAULT '[
        {"from": "KRW", "to": "EUR", "rate": 0.00068, "lastUpdated": "2024-01-01T00:00:00.000Z"},
        {"from": "USD", "to": "EUR", "rate": 0.93, "lastUpdated": "2024-01-01T00:00:00.000Z"},
        {"from": "JPY", "to": "EUR", "rate": 0.0059, "lastUpdated": "2024-01-01T00:00:00.000Z"}
    ]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Insert default config if not exists
INSERT INTO site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert default exchange rates if not exists
INSERT INTO exchange_rates (id) VALUES (1) ON CONFLICT (id) DO NOTHING;