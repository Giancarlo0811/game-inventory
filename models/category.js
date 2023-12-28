const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {type: String, required: true, maxLenght: 100},
});

// virtual for category's URL
CategorySchema.virtual('url').get(function() {
    return `/catalog/category/${this._id}`;
});

// export model
module.exports = mongoose.model('Category', CategorySchema);