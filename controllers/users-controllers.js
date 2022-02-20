const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const { User } = require('../models/users')



const getUsers = async(req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Somthing went wrong', 500);
        return next(error)
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) });

};

const signup = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findone({ email: email })
    } catch (err) {
        const error = new HttpError('Somthing went wrong', 500);
        return next(error)
    };

    if (existingUser) {
        const error = new HttpError('user already exsit', 422);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: '',
        password,
        dogs: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'signing up user failed, please try again.',
            500
        );
        return next(error);
    }

    DUMMY_USERS.push(createdUser);

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async(req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findone({ email: email })
    } catch (err) {
        const error = new HttpError('Somthing went wrong', 500);
        return next(error)
    };
    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('invalid datails', 401);
        return next(error);
    }
    res.json({ message: 'Logged in!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;