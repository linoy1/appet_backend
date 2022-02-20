const HttpError = require('../models/http-error');
const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const { Dog } = require('../models/dogs')
const { User } = require('../models/users')

const getCoordsForAddress = require('../util/location');
const mongoose = require('mongoose');


const getDogsById = async(req, res, next) => {
    const dogId = req.params.id;
    let dog;

    try {
        dog = await Dog.findById(dogId);
    } catch (err) {
        const error = new HttpError('SOMTHING WENT WRONG', 500);
        return next(error);
    }
    if (!dog) {
        const error = HttpError('Could not find a dog for the provided id.', 404);
        return next(error);
    }

    res.json({ dog: dog.toObject({ getters: true }) });
};


const getDogsByUserId = async(req, res, next) => {
    const userId = req.params.uid;

    // let dogs
    let userWithDogs;
    try {
        userWithDogs = await User.findById(userId).populate('dogs');
    } catch (err) {
        const error = new HttpError('SOMTHING WENT WRONG', 500);
        return next(error);
    }

    if (!userWithDogs || userWithDogs.dogs.length === 0) {
        return next(
            new HttpError('Could not find a dogs for the provided user id.', 404)
        );
    }

    res.json({ dogs: userWithDogs.dogs.map(dog => dog.toObject({ getters: true })) });
};

const createDog = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        next(new HttpError('invalid input,please check again', 404));
    }
    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdDog = new Dog({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg',
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError(
            'Creating dog failed, please try again.',
            500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError(
            'Could not fnd user for provider id',
            404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdDog.save({ session: sess });
        user.dogs.push(createdDog);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {

        const error = new HttpError(
            'Creating dog failed, please try again.',
            500
        );
        return next(error);
    }
    res.status(201).json({ dog: createdDog });
};

const updateDog = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { title, description } = req.body;
    const dogId = req.params.id;

    let dog;

    try {
        dog = await Dog.findById(dogId);
    } catch (err) {
        const error = new HttpError('SOMTHING WENT WRONG', 500);
        return next(error);
    }

    dog.title = title;
    dog.description = description;

    try {
        dog = await dog.save();
    } catch (err) {
        const error = new HttpError('SOMTHING WENT WRONG', 500);
        return next(error);
    }


    res.json({ dog: dog.toObject({ getters: true }) });
};

const deleteDog = async(req, res, next) => {
    const dogId = req.params.id;
    let dog;

    try {
        dog = await Dog.findById(dogId).populate('creator');
    } catch (err) {
        const error = new HttpError('SOMTHING WENT WRONG', 500);
        return next(error);
    }

    if (!dog) {
        const error = new HttpError('SOMTHING WENT WRONG', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await dog.remove({ session: sess });
        dog.creator.dogs.pull(dog);
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('SOMTHING WENT WRONG', 500);
        return next(error);
    }

    res.status(200).json({ message: 'Deleted dog.' });
};

exports.getDogsById = getDogsById;
exports.getDogsByUserId = getDogsByUserId;
exports.createDog = createDog;
exports.updateDog = updateDog;
exports.deleteDog = deleteDog;