const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameSchema = new Schema({
    name: {type: String, required: true, maxLenght: 100},
    description: {type: String, required: true,  maxLenght: 250},
    price: {type: Number, required: true},
    number_of_items: {type: Number, required: true},
    category: [{type: Schema.Types.ObjectId, ref: 'Category' }],
});

// virtual for game's URL
GameSchema.virtual('url').get(function() {
    return `/catalog/game/${this._id}`;
});

// export model
module.exports = mongoose.model('Game', GameSchema);