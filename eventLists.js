const mongoose = require('mongoose')
const Schema = mongoose.Schema

const eventListSchema = new Schema({
    type:{
        type: String,
    },
    events: [
        {
            time: {
                type: Date,
            },
            aditionalData: {
                type: String
            }
        }
    ],
})

module.exports = mongoose.model('DenoteEventLists', eventListSchema)