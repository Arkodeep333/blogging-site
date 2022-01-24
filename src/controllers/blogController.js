
const blogModel = require('../models/blogModel')
const authorModel = require('../models/authorModel')

const mongoose = require("mongoose")

const validObject = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidrequestBody = function (requestBody) {
    return Object.keys(requestBody).length !== 0

}

const createBlog = async function (req, res) {
    try {
        let blogBody = req.body
        const { title, body, authorId, tags, category, subcategory, isPublished } = blogBody
        if(!isValidrequestBody(blogBody)){
            return res.status(400).send({status: false, message: "Enter valid blog details to create"})
        }
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: 'Blog Title is required' })
            return
        }

        if (!isValid(body)) {
            return res.status(400).send({ status: false, message: 'body is missing' })

        }

        if (!isValid(authorId)) {
            return res.status(400).send({ status: false, message: 'Author id is required' })

        }

        if (!validObject(authorId)) {
            return res.status(400).send({ status: false, message: `${authorId} is not a valid author id` })

        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: 'Blog category is required' })

        }

        const author = await authorModel.findById(authorId);

        if (!author) {
            return res.status(400).send({ status: false, message: `Author does not exit` })

        }
        const blogData = {
            title,
            body,
            authorId,
            category,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null
        }
        if (tags) {
            if (Array.isArray(tags)) {
                blogData['tags'] = [...tags]
                console.log(blogData)
            }
            if (Object.prototype.toString.call(tags) === "[object String]") {
                blogData['tags'] = [tags]

            }


        }
        if (subcategory) {
            if (Array.isArray(subcategory)) {
                blogData['subcategory'] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) === "[object String]") {
                blogData['subcategory'] = [subcategory]

            }

        }
        if (category) {
            if (Array.isArray(category)) {
                blogData['subcategory'] = [...category]
            }
            if (Object.prototype.toString.call(category) === "[object String]") {
                blogData['subcategory'] = [category]

            }

        }

        let blogCreated = await blogModel.create(blogData)
        if (blogCreated) {
            return res.status(201).send({ status: true, message: "Successful", data: blogCreated })
        }

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.createBlog = createBlog

const getBlog = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false, isPublished: true }
        const queryParams = req.query

        if (isValidrequestBody(queryParams)) {
            const { authorId, category, tags, subcategory } = queryParams

            if (isValid(authorId) && validObject(authorId)) {
                filterQuery['authorId'] = authorId
            }

            if (isValid(category)) {
                filterQuery['category'] = category.trim()
            }

            if (isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filterQuery['tags'] = { $all: tagsArr }
            }

            if (isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(i => i.trim());
                filterQuery['subcategory'] = { $all: subcatArr }
            }
        }

        const blogs = await blogModel.find(filterQuery)

        if (Array.isArray(blogs) && blogs.length === 0) {
            res.status(404).send({ status: false, message: 'No blogs found' })
            return
        }

        res.status(200).send({ status: true, message: 'Blogs list', data: blogs })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports.getBlog = getBlog

const updateBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId
        let updateBody = req.body
        
        if (!validObject(blogId)) {
            return res.status(400).send({ status: false, message: "blogId is not valid" })
        }

        let findBlog = await blogModel.findOne({ isDeleted: false, _id: blogId })
        if (!findBlog) {
            return res.status(404).send({ status: false, message: "blog does not exist" })
        }
        console.log(findBlog.authorId)
        console.log(JSON.stringify(req.userId))
        if(JSON.stringify(findBlog.authorId) !== JSON.stringify(req.userId)){
            return res.status(401).send({status: false, message: "Access denied"})
            
        }

        const { title, body, tags, category, subcategory, isPublished } = updateBody
        let updateField = {}
        if(isValid(title)) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$set')) updateField['$set'] = {}

            updateField['$set']['title'] = title
        }

        if(isValid(body)) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$set')) updateField['$set'] = {}

            updateField['$set']['body'] = body
        }

        if(isValid(category)) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$set')) updateField['$set'] = {}

            updateField['$set']['category'] = category
        }

        if(isPublished !== undefined) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$set')) updateField['$set'] = {}

            updateField['$set']['isPublished'] = isPublished
            updateField['$set']['publishedAt'] = isPublished ? new Date() : null
        }
        
        if(tags) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$addToSet')) updateField['$addToSet'] = {}
            
            if(Array.isArray(tags)) {
                updateField['$addToSet']['tags'] = { $each: [...tags]}
            }
            if(typeof tags === "string") {
                updateField['$addToSet']['tags'] = tags
            }
        }

        if(subcategory) {
            if(!Object.prototype.hasOwnProperty.call(updateField, '$addToSet')) updateField['$addToSet'] = {}
            if(Array.isArray(subcategory)) {
                updateField['$addToSet']['subcategory'] = { $each: [...subcategory]}
            }
            if(typeof subcategory === "string") {
                updateField['$addToSet']['subcategory'] = subcategory
            }
        }

        const updatedBlog = await blogModel.findOneAndUpdate({_id: blogId}, updateField, {new: true})

        res.status(200).send({status: true, message: 'Blog updated successfully', data: updatedBlog});
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
module.exports.updateBlog = updateBlog
const deleteBlogByID = async function (req, res) {
    try {
        let blogId = req.params.blogId
        if(!validObject(blogId)){
            return res.status(400).send({status: false, message: "Enter a valid blogId"})
        }
        let checkBlog = await blogModel.findOne({_id: blogId, isDeleted: false})
        if(!checkBlog){
            return res.status(400).send({status: false, message: "The blog has already been deleted"})
        }
        if(JSON.stringify(checkBlog.authorId) !== JSON.stringify(req.userId)){
            return res.status(401).send({status: false, message: "Access denied"})
            
        }
        let deleteBlog = await blogModel.findOneAndUpdate({_id: blogId}, {isDeleted: true, deletedAt: new Date() }, {new: true})
        res.status(200).send({status: true, message: "Blog successfully deleted" })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
module.exports.deleteBlogByID = deleteBlogByID

const deleteWithParams = async function (req, res) {
    try {
        const filterQuery = {isDeleted: false}
        const queryParams = req.query
        let authorIdFromToken = JSON.stringify(req.userId)
    
        if(JSON.stringify(findBlog.authorId) !== JSON.stringify(req.userId)){
            return res.status(401).send({status: false, message: "Access denied"})
            
        }
        if (!isValidrequestBody(queryParams)) {
            res.status(400).send({ status: false, message: "Nothing to delete" })
            return
        }

        const { authorId, category, tags, subcategory, isPublished } = queryParams

        if (isValid(authorId) && isValidObjectId(authorId)) {
            filterQuery['authorId'] = authorId
        }

        if (isValid(category)) {
            filterQuery['category'] = category
        }

        if (isValid(isPublished)) {
            filterQuery['isPublished'] = isPublished
        }

        if (isValid(tags)) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim());
            filterQuery['tags'] = { $all: tagsArr }
        }

        if (isValid(subcategory)) {
            const subcatArr = subcategory.trim().split(',').map(i => i);
            filterQuery['subcategory'] = { $all: subcatArr }
        }

        const blogs = await blogModel.find(filterQuery);

        if (blogs.length == 0) {
            res.status(404).send({ status: false, message: "No blogs found" })
            return
        }


        const idsOfBlogsToDelete = blogs.map(blog => {
            if (blog.authorId.toString() === authorIdFromToken) return blog._id
        })

        if (idsOfBlogsToDelete.length === 0) {
            res.status(404).send({ status: false, message: 'No blogs found' })
            return
        }

        await blogModel.updateMany({ _id: { $in: idsOfBlogsToDelete } }, { $set: { isDeleted: true, deletedAt: new Date() } })

        res.status(200).send({ status: true, message: 'Blog/ blogs deleted successfully' });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports.deleteWithParams = deleteWithParams


