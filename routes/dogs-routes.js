const express = require('express');
const dogsControllers = require('../controllers/dogs-controllers');
const { check } = require('express-validator');
const router = express.Router();


router.get('/:pid', dogsControllers.getDogsById);

router.get('/user/:uid', dogsControllers.getDogsByUserId);

router.post('/', [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
], dogsControllers.createDog);

router.patch('/:pid', [
    check('title')
    .not()
    .isEmpty(),
    check('description').isLength({ min: 5 })
], dogsControllers.updateDog);

router.delete('/:pid', dogsControllers.deleteDog);

module.exports = router;