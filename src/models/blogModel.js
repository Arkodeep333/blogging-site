const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId
const blogs = new mongoose.Schema({

  title: {type: String, required: true},
   body: {type: String, required: true},
   authorId: {type: ObjectId, refs: 'Author'},
   tags: [{type: String}],
   category: [{type: String, required: true}], 
   subcategory: {type: [String]}, 
      //  createdAt, 
      //  updatedAt,
    deletedAt: {type: Date},
    isDeleted: {type: Boolean, default: false},
    publishedAt: {type: Date},
    isPublished: {type: Boolean, default: false}

}, { timestamps: true })

module.exports = mongoose.model('blogs', blogs )