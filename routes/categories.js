const express = require('express')
let router = express.Router()
let slugify = require('slugify')
let categorySchema = require('../schemas/categories');
let productSchema = require('../schemas/products');

router.get('/:id', async (req, res) => {
    try {
        let dataCategories = await categorySchema.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!dataCategories) {
            res.status(404).send({ message: "ID NOT FOUND" })
        } else {
            res.send(dataCategories)
        }
    } catch (error) {
        res.status(404).send({ message: "something went wrong" })
    }
})

router.get('/', async (req, res) => {
    let dataCategories = await categorySchema.find({ isDeleted: false });
    res.send(dataCategories)
})

router.get('/:id/products', async (req, res) => {
    try {
        let result = await productSchema.find({
            category: req.params.id,
            isDeleted: false
        }).populate('category');
        
        if (result.length == 0) {
            return res.status(404).send({ message: "No products found for this category" });
        }
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
})

router.post('/', async function (req, res, next) {
    try {
        let newItem = new categorySchema({
            name: req.body.name,
            slug: slugify(req.body.name, {
                replacement: '-',
                lower: true,
                strict: true
            }),
            image: req.body.image
        })
        await newItem.save();
        res.status(201).send(newItem)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

router.put('/:id', async function (req, res, next) {
    try {
        if (req.body.name) {
            req.body.slug = slugify(req.body.name, {
                replacement: '-',
                lower: true,
                strict: true
            });
        }
        let getItem = await categorySchema.findByIdAndUpdate(
            req.params.id, req.body, { new: true, runValidators: true }
        )
        if (getItem) {
            res.send(getItem)
        } else {
            res.status(404).send({ message: "ID NOT FOUND" })
        }
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

router.delete('/:id', async function (req, res, next) {
    try {
        let getItem = await categorySchema.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!getItem) {
            res.status(404).send({ message: "ID NOT FOUND" })
        } else {
            res.send({ message: "Category deleted", data: getItem })
        }
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

module.exports = router;