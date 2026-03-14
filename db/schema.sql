-- Create config table
CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    shipping_cost INTEGER NOT NULL DEFAULT 3500,
    shipping_to_pristina INTEGER NOT NULL DEFAULT 350,
    contact_email VARCHAR(255) NOT NULL DEFAULT 'blerart@outlook.com',
    contact_phone VARCHAR(50) NOT NULL DEFAULT '+383 49 195 414',
    site_name VARCHAR(100) NOT NULL DEFAULT 'Vetura Korea Kosova',
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    vehicle_types JSONB NOT NULL DEFAULT '{
        "suv": {"shippingCost": 4500, "enabled": false},
        "sedan": {"shippingCost": 3500, "enabled": true},
        "hatchback": {"shippingCost": 3500, "enabled": true},
        "wagon": {"shippingCost": 3500, "enabled": true},
        "coupe": {"shippingCost": 3500, "enabled": true},
        "van": {"shippingCost": 3800, "enabled": true},
        "pickup": {"shippingCost": 4000, "enabled": true},
        "default": {"shippingCost": 3500, "enabled": true}
    }',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default config
INSERT INTO site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;