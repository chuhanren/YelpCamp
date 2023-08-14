const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image:String,
    price: Number,
    description: String,
    location:String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
})

//delete middleware
CampgroundSchema.post('findOneAndDelete', async function(doc){
    // console.log(doc);//see what's deleted
    if(doc) {//if find doc, remove all reviews
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);