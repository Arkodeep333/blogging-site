const express = require('express');

const router = express.Router();


const authorcontroller=require("../controllers/authorController")
const blogController=require("../controllers/blogController")
const Middleware=require("../middleware/Authentication")





// Author
router.post('/authors',authorcontroller.createAuthor)
router.post('/login', authorcontroller.authorLogin)

// Blog 
router.post('/blogs', blogController.createBlog)
router.get('/blogs', blogController.getBlog)
router.put('/blogs/:blogId',Middleware.autherAuth,blogController.updateBlog)
router.delete('/blogs/:blogId',Middleware.autherAuth,blogController.deleteBlogByID)
router.delete('/blogs',Middleware.autherAuth,blogController.deleteWithParams)

module.exports = router;
