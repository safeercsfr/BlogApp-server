const express = require('express')

const router = express.Router()

const {
    getPosts,
    getPost,
    addPost,
    deletePost,
    updatePost,
    searchPost,
    likePost,
    commentPost
} = require('../controllers/postController')

router.get("/", getPosts)
// router.get("/",(req,res)=>{
//     res.send("route works")
// })
router.get("/:id", getPost)
router.post("/", addPost)
router.delete("/:id", deletePost)
router.put("/:id", updatePost)
router.get('/searchPost/:key', searchPost)

router.patch("/:id/like", likePost);
router.patch("/:id/comment", commentPost);




module.exports = router