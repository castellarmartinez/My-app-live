const express = require('express')
const {addProduct, getProducts, updateProduct, deleteProduct} = 
require('../controllers/products-controller')
const { adminAuthentication } = require('../middlewares/auth')
const cacheProducts = require('../middlewares/cache')
const { tryValidProduct, tryRegisteredProduct, tryProductExist } = 
require('../middlewares/product-validation')


const router = express.Router()

/**
 * @swagger
 * /products/add/{productId}:
 *  post:
 *      tags: [Products]
 *      summary: Add a product to the menu.
 *      description: Allow addition of new products.
 *      parameters:
 *      -   name: "productId"
 *          in: "path"
 *          required: true
 *          type: "string"
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/addition'
 *      responses:
 *          201:
 *              description: The product was added successfuly.
 *          400:
 *              description: The product data is invalid.
 *          401:
 *              description: You need admin privileges.
 */

 router.post('/add/:id/', adminAuthentication, tryRegisteredProduct, 
 tryValidProduct, async (req, res) => 
 {
     const newProduct = req.body
     const ID = req.params.id
     const success = await addProduct(newProduct, ID)
 
     if(success)
     {
         res.status(201).send('The product has been added.')
     }
     else
     {
         res.status(500).send('Unable to add the product.')
     }
 })
 
/**
 * @swagger
 * /products/list:
 *  get:
 *      tags: [Products]
 *      summary: Obtain all products in the menu.
 *      description: Return a list of the products.
 *      responses:
 *          200:
 *              description: Succesfully operation.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/productList'
 *          500:
 *              description: Internal error.
 */

router.get('/list', cacheProducts, async (req, res) => 
{
    const products = await getProducts()

    if(products)
    {
        res.status(200).json(products)
    }
    else
    {
        res.status(500).send('Could not access products.')
    }
})

/**
 * @swagger
 * /products/update/{productId}:
 *  put:
 *      tags: [Products]
 *      summary: Edit a product on the menu.
 *      description: Allow edition of products.
 *      parameters:
 *      -   name: "productId"
 *          in: "path"
 *          required: true
 *          type: "string"
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/edition'
 *      responses:
 *          200:
 *              description: Successful operation.
 *          400:
 *              description: Product data is invalid.
 *          401:
 *              description: You need admin privileges to peform this operation.
 */

router.put('/update/:id/', adminAuthentication, 
tryProductExist, tryValidProduct, async (req, res) => 
{
    const update = req.body
    const ID = req.params.id
    const success = await updateProduct(ID, update)

    if(success)
    {
        res.status(200).send('The product has been updated.')
    }
    else
    {
        res.status(500).send('Could not update the product.')
    }
})

/**
 * @swagger
 * /products/delete/{productId}:
 *  delete:
 *      tags: [Products]
 *      summary: Delete a product from the menu.
 *      description: Allow elimination of products.
 *      parameters:
 *      -   name: "productId"
 *          in: "path"
 *          required: true
 *          type: "string"
 *      responses:
 *          200:
 *              description: Successful operation.
 *          400:
 *              description: The product you intent to delete, does not exist.
 *          401:
 *              description: You need admin privileges to perform this operation.
 */

router.delete('/delete/:id/',  adminAuthentication, tryProductExist, 
async (req, res) => 
{
    const ID = req.params.id
    const success = await deleteProduct(ID)

    if(success)
    {
        res.status(200).send('The product has been deleted.')
    }
    else
    {
        res.status(500).send('Could not delete the product.')
    }
})

/**
 * @swagger
 * tags:
 *  name: Products
 *  description: Products section
 * 
 * components: 
 *  schemas:
 *      addition:
 *          type: object
 *          properties:
 *              name:
 *                  type: string
 *              price:
 *                  type: integer
 *          example:
 *              name: Changua
 *              price: 3000
 */

/**
 * @swagger
 * tags:
 *  name: Products
 *  description: Products section
 * 
 * components: 
 *  schemas:
 *      productList:
 *          type: object
 *          properties:
 *              nombre:
 *                  type: string
 *              precio:
 *                  type: integer
 *              ID:
 *                  type: string
 *          example:
 *              name: Changua
 *              price: 3000
 *              ID: DR153
 */

/**
 * @swagger
 * tags:
 *  name: Products
 *  description: Products section
 * 
 * components: 
 *  schemas:
 *      edition:
 *          type: object
 *          properties:
 *              nombre:
 *                  type: string
 *              precio:
 *                  type: integer
 *          example:
 *              name: Ajiaco
 *              price: 500
 */

module.exports = router