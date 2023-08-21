const mongoose = require('mongoose')
const Post = require('../models/post.js')
const ObjectId = mongoose.Types.ObjectId
const jwt = require('jsonwebtoken')
const fs = require("fs");
const path = require("path");

//READ

const getPosts = async (req, res) => {

    try {
        let cat = req.query.cat
        if (cat) {
            const posts = await Post.find({ cat: cat }).populate('author', 'username')
            res.status(200).json(posts)

        } else {
            const posts = await Post.find().populate('author', 'username')
            res.status(200).json(posts)
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//READ

const getPost = async (req, res) => {

    const id = req.params.id
    try {
        const post = await Post.findById(id).populate('author', 'username').populate({
            path: 'comments',
            populate: { path: 'author', select: 'username' },
            options: { sort: { createdAt: -1 } }
        })
            .exec();

        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

//CREATE

const addPost = async (req, res) => {

    try {
        const { author, title, desc, cat, img } = req.body

        const newPost = new Post({
            author: author._id,
            title,
            img,
            desc,
            cat
        });

        await newPost.save()
        res.status(200).json("post has been created")
    } catch (error) {
        res.status(500).json("something went wrong.")
    }
}

//DELETE

const deletePost = async (req, res) => {

    try {
        const token = req.cookies.access_token

        if (!token) return res.status(401).json("not authenticated")

        jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
            if (err) return res.status(403).json("Token not valid")
        })
        const postId = req.params.id

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const imagePath = path.join(__dirname, "../../client/public/upload", post.img);

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        await Post.findByIdAndDelete(postId);
        const posts = await Post.find().populate('author', 'username')


        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json("something went wrong")
    }
}

//UPDATE

const updatePost = async (req, res) => {

    try {
        const postId = req.params.id
        const { author, title, desc, cat, img } = req.body

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                author: author._id,
                title, img, desc, cat
            },
            { new: true }
        );

        res.status(200).json("post has been updated")
    } catch (error) {
        res.status(500).json("something went wrong")
    }
}

//SEARCH

const searchPost = async (req, res) => {
    const { key } = req.params
    try {
        const posts = await Post.find().populate('author', 'username')

        const regex = new RegExp(key, "i");
        const filteredArr = posts.filter(obj => regex.test(obj.title));
        res.status(200).json(filteredArr);
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

//LIKE/UNLIKE

const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const post = await Post.findById(id);

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            post.likes = post.likes.filter(userId => userId !== userId);
        } else {
            post.likes.push(userId);
        }

        const updatedPost = await post.save();

        const populatedPost = await Post.findById(updatedPost._id)
            .populate('author', 'username')

        res.status(200).json(populatedPost);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

//COMMENT

const commentPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, userId } = req.body;
        if (comment.trim().length < 1) {
            res.status(404).json({ message: "validation failed" });

        }
        const post = await Post.findById(id);
        post.comments.unshift({ text: comment, author: userId, isDelete: false });

        const savedPost = await post.save();

        const populatedPost = await Post.findById(savedPost._id)
            .populate('author', 'username')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username' },
                options: { sort: { createdAt: -1 } }
            })
            .exec();
        res.status(201).json(populatedPost.comments);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

module.exports = {
    getPosts,
    getPost,
    addPost,
    deletePost,
    updatePost,
    searchPost,
    likePost,
    commentPost
}