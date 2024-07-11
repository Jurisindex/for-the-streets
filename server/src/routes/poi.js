const express = require('express');
const http = require('http');
const https = require('https');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const validateAstrologicalSign = (value) => {
    const validSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return validSigns.includes(value);
};

const createPoiValidation = [
    body('name').notEmpty().trim().escape(),
    body('state').notEmpty().trim().escape(),
    body('pic_url').isURL().custom((value) => {
        return new Promise((resolve, reject) => {
            const protocol = value.startsWith('https') ? https : http;
            protocol.get(value, (res) => {
                const contentType = res.headers['content-type'];
                if (res.statusCode === 200 && contentType && contentType.startsWith('image/')) {
                    resolve();
                } else {
                    reject(new Error('URL does not point to a valid image'));
                }
            }).on('error', (e) => {
                reject(new Error('Invalid URL'));
            });
        });
    }),
    body('sun_sign').custom(validateAstrologicalSign),
    body('pluto_sign').custom(validateAstrologicalSign),
];

const updatePoiValidation = [
    body('name').optional().notEmpty().trim().escape(),
    body('state').optional().notEmpty().trim().escape(),
    body('pic_url').optional().isURL(),
    body('sun_sign').optional().custom(validateAstrologicalSign),
    body('pluto_sign').optional().custom(validateAstrologicalSign),
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.get('/', async (req, res) => {
    const db = req.app.locals.db;

    try {
        const pois = await db.all(`
            SELECT 
                p.*, 
                sun.sign_name as sun_sign, 
                pluto.sign_name as pluto_sign
            FROM person_of_interest p
            LEFT JOIN astrological_signs sun ON p.sun_sign_id = sun.id
            LEFT JOIN astrological_signs pluto ON p.pluto_sign_id = pluto.id
        `);
        res.json(pois);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch POIs' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;

    try {
        const poi = await db.get(`
            SELECT 
                p.*, 
                sun.sign_name as sun_sign, 
                pluto.sign_name as pluto_sign
            FROM person_of_interest p
            LEFT JOIN astrological_signs sun ON p.sun_sign_id = sun.id
            LEFT JOIN astrological_signs pluto ON p.pluto_sign_id = pluto.id
            WHERE id = ?
        `, id);
        if (poi) {
            res.json(poi);
        } else {
            res.status(404).json({ error: 'POI not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch POI' });
    }
});

router.post('/', createPoiValidation, handleValidationErrors, async (req, res) => {
    const { name, state, pic_url, sun_sign, pluto_sign } = req.body;
    const db = req.app.locals.db;

    try {
        const sunSignId = await db.get('SELECT id FROM astrological_signs WHERE sign_name = ?', sun_sign);
        const plutoSignId = await db.get('SELECT id FROM astrological_signs WHERE sign_name = ?', pluto_sign);

        const result = await db.run(
            'INSERT INTO person_of_interest (name, state, pic_url, sun_sign_id, pluto_sign_id) VALUES (?, ?, ?, ?, ?)',
            [name, state, pic_url, sunSignId.id, plutoSignId.id]
        );

        const newPoi = await db.get(`
            SELECT 
                p.*, 
                sun.sign_name as sun_sign, 
                pluto.sign_name as pluto_sign
            FROM person_of_interest p
            LEFT JOIN astrological_signs sun ON p.sun_sign_id = sun.id
            LEFT JOIN astrological_signs pluto ON p.pluto_sign_id = pluto.id
            WHERE p.id = ?
        `, result.lastID);

        res.status(201).json(newPoi);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create POI' });
    }
});

router.put('/:id', updatePoiValidation, handleValidationErrors, async (req, res) => {
    const { id } = req.params;
    const { name, state, pic_url, sun_sign, pluto_sign } = req.body;
    const db = req.app.locals.db;

    try {
        let updates = [];
        let values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (state) {
            updates.push('state = ?');
            values.push(state);
        }
        if (pic_url) {
            updates.push('pic_url = ?');
            values.push(pic_url);
        }
        if (sun_sign) {
            const sunSignId = await db.get('SELECT id FROM astrological_signs WHERE sign_name = ?', sun_sign);
            updates.push('sun_sign_id = ?');
            values.push(sunSignId.id);
        }
        if (pluto_sign) {
            const plutoSignId = await db.get('SELECT id FROM astrological_signs WHERE sign_name = ?', pluto_sign);
            updates.push('pluto_sign_id = ?');
            values.push(plutoSignId.id);
        }

        if (updates.length > 0) {
            const updateQuery = `UPDATE person_of_interest SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            values.push(id);
            await db.run(updateQuery, values);
        }

        res.json({ message: 'POI updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update POI' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;

    try {
        await db.run('BEGIN TRANSACTION');

        // Delete related opinions first
        await db.run('DELETE FROM opinions WHERE poi_id = ?', id);

        // Then delete the POI
        await db.run('DELETE FROM person_of_interest WHERE id = ?', id);

        await db.run('COMMIT');

        res.json({ message: 'POI and related opinions deleted successfully' });
    } catch (error) {
        await db.run('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Failed to delete POI and related opinions' });
    }
});

router.patch('/:id/vip-count', [
    body('vip_count').isInt({ min: 0 }),
], handleValidationErrors, async (req, res) => {
    const { id } = req.params;
    const { vip_count } = req.body;
    const db = req.app.locals.db;

    try {
        await db.run('UPDATE person_of_interest SET vip_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [vip_count, id]);
        res.json({ message: 'VIP count updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update VIP count' });
    }
});

module.exports = router;