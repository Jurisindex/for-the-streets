const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const allowedCoreTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
const allowedDatingTraits = ['oscar_worthy_actress', 'witness_protection', 'hole_in_one', 'raw_dog', 'miss_leading', 
                             'grab_and_ghost', 'victim_mentality', 'yes_means_no', 'catches_flights', 'alpha_widow'];

const isValidCoreTrait = (trait, value) => {
    return allowedCoreTraits.includes(trait) && typeof value === 'number' && value >= 1 && value <= 5;
};

const isValidDatingTrait = (trait, value) => {
    if (!allowedDatingTraits.includes(trait)) return false;
    if (trait === 'grab_and_ghost') {
        return typeof value === 'object' && 
               typeof value.value === 'boolean' && 
               (!value.value || (typeof value.amount === 'number' && value.amount >= 0 && value.amount <= 100000000));
    }
    return typeof value === 'boolean';
};

const validateOpinionData = (opinionData) => {
    if (!opinionData.core || !opinionData.dating) return false;

    return Object.entries(opinionData.core).every(([trait, value]) => isValidCoreTrait(trait, value)) &&
           Object.entries(opinionData.dating).every(([trait, value]) => isValidDatingTrait(trait, value));
};

router.get('/', async (req, res) => {
    const db = req.app.locals.db;

    try {
        const opinions = await db.all('SELECT * FROM opinions');
        const formattedOpinions = opinions.map(opinion => ({
            ...opinion,
            opinion_data: JSON.parse(opinion.opinion_data)
        }));
        res.json(formattedOpinions);
    } catch (error) {
        console.error('Error fetching opinions:', error);
        res.status(500).json({ error: 'Failed to fetch opinions' });
    }
});

router.post('/', [
    body('poi_id').isInt({ min: 1 }),
    body('opinion_data').custom(validateOpinionData),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { poi_id, opinion_data } = req.body;
    const db = req.app.locals.db;

    try {
        const result = await db.run(
            'INSERT INTO opinions (poi_id, user_id, opinion_data) VALUES (?, 1, ?)',
            [poi_id, JSON.stringify(opinion_data)]
        );

        res.status(201).json({ id: result.lastID, poi_id, opinion_data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create opinion' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;

    try {
        await db.run('DELETE FROM opinions WHERE id = ?', id);
        res.json({ message: 'Opinion deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete opinion' });
    }
});

module.exports = router;