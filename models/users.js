const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    image: { type: String, required: true },
    places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Dog' }],

});
// userSchema.plugin(uniqueValidator);
module.export = mongoose.model('User', userSchema);