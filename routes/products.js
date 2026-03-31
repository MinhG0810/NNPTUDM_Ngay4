const express = require('express')
let router = express.Router()
let slugify = require('slugify')
let productSchema = require('../schemas/products');

router.get('/', async (req, res) => {
    try {
        let result = await productSchema.find({ isDeleted: false }).populate('category');
        res.send(result)
    } catch (error) {
        res.status(404).send({ message: "something went wrong", error: error.message })
    }
})

router.get('/:id', async (req, res) => {
    try {
        let result = await productSchema.findOne({ _id: req.params.id, isDeleted: false }).populate('category');
        if (!result) return res.status(404).send({ message: "ID NOT FOUND" });
        res.send(result)
    } catch (error) {
        res.status(404).send({ message: "something went wrong", error: error.message })
    }
})

router.post('/', async (req, res) => {
    try {
        let newProduct = new productSchema({
            title: req.body.title,
            slug: slugify(req.body.title, {
                replacement: '-',
                lower: true,
                strict: true
            }),
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            images: req.body.images
        })
        await newProduct.save();
        res.status(201).send(newProduct)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

router.put('/:id', async (req, res) => {
    try {
        // If title is updated, we also need to update the slug
        if (req.body.title) {
            req.body.slug = slugify(req.body.title, {
                replacement: '-',
                lower: true,
                strict: true
            });
        }
        
        let getProduct = await productSchema.findByIdAndUpdate(
            req.params.id, req.body, { new: true, runValidators: true }
        ).populate('category');

        if (getProduct) {
            res.send(getProduct)
        } else {
            res.status(404).send({ message: "ID NOT FOUND" })
        }
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        let getProduct = await productSchema.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        
        if (!getProduct) {
            res.status(404).send({ message: "ID NOT FOUND or already deleted" })
        } else {
            res.send({ message: "Product deleted successfully", data: getProduct })
        }
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

module.exports = router;