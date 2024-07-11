module.exports = {
    up: async (db) => {
        // Create astrological_signs table
        await db.run(`
            CREATE TABLE IF NOT EXISTS astrological_signs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sign_name TEXT UNIQUE NOT NULL
            )
        `);

        // Populate astrological_signs
        await db.run(`
            INSERT OR IGNORE INTO astrological_signs (sign_name) VALUES
            ('Aries'), ('Taurus'), ('Gemini'), ('Cancer'), ('Leo'), ('Virgo'),
            ('Libra'), ('Scorpio'), ('Sagittarius'), ('Capricorn'), ('Aquarius'), ('Pisces')
        `);

        // Create users table
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create person_of_interest table
        await db.run(`
            CREATE TABLE IF NOT EXISTS person_of_interest (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER DEFAULT 1,
                name TEXT NOT NULL,
                state TEXT NOT NULL,
                pic_url TEXT NOT NULL,
                sun_sign_id INTEGER NOT NULL,
                pluto_sign_id INTEGER NOT NULL,
                vip_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (sun_sign_id) REFERENCES astrological_signs(id),
                FOREIGN KEY (pluto_sign_id) REFERENCES astrological_signs(id)
            )
        `);

        // Create reviews table
        await db.run(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                poi_id INTEGER,
                user_id INTEGER DEFAULT 1,
                review_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (poi_id) REFERENCES person_of_interest(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Create opinions table
        await db.run(`
            CREATE TABLE IF NOT EXISTS opinions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                poi_id INTEGER NOT NULL,
                user_id INTEGER DEFAULT 1,
                opinion_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (poi_id) REFERENCES person_of_interest(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(poi_id, user_id)
            )
        `);

        // Insert example opinion
        await db.run(`
            INSERT INTO opinions (poi_id, user_id, opinion_data) 
            VALUES (
                0, 
                0, 
                '{
                    "core": {
                        "openness": 4,
                        "conscientiousness": 3,
                        "extraversion": 5,
                        "agreeableness": 2,
                        "neuroticism": 1
                    },
                    "dating": {
                        "oscar_worthy_actress": true,
                        "witness_protection": false,
                        "hole_in_one": true,
                        "raw_dog": false,
                        "miss_leading": true,
                        "grab_and_ghost": {
                            "value": true,
                            "amount": 50000
                        },
                        "victim_mentality": false,
                        "yes_means_no": true,
                        "catches_flights": false,
                        "alpha_widow": true
                    }
                }'
            )
        `);

        // Create indices
        await db.run('CREATE INDEX idx_poi_user ON person_of_interest(user_id)');
        await db.run('CREATE INDEX idx_reviews_poi ON reviews(poi_id)');
        await db.run('CREATE INDEX idx_opinions_poi_user ON opinions(poi_id, user_id)');
    },
    down: async (db) => {
        await db.run('DROP TABLE IF EXISTS opinions');
        await db.run('DROP TABLE IF EXISTS reviews');
        await db.run('DROP TABLE IF EXISTS person_of_interest');
        await db.run('DROP TABLE IF EXISTS users');
        await db.run('DROP TABLE IF EXISTS astrological_signs');
    }
};