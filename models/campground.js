const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image:String,
    price: Number,
    description: String,
    location:String,
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
    if(doc) {
        await review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);