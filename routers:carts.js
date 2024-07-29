const express = require('express');
const Cart = require('../models/Cart');
const product = require('../models/Ticket');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/:cid/purchase', authMiddleware(['user']), async (req, res)=> {
    const cartId = req.params.cid;
    const userId = req.user._id;

    try {
        const cart = await
Cart.findById(cartId).populate('products.product');
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const productsToPurchase = [];
      const productsNotPurchased = [];

      for (const item of cart.products) {
        const product = item.product;
        const quantity = item.quantity;

        if (product.stock >= quantity) {
            product.stock -= quantity;
            await product.save();
            productsToPurchase.push({ product, quantity });
        } else {
            productsNotPurchased.push(product._id);
        }
      }

      const ticket = await Ticket.create({
        code: generateUniqueCode(),
        amount: calculateTotalAmount(productsToPurcharse),
        purchaser: req.user.email
      });

      cart.products = cart.products.filter(item => productsNotPurchased.includes(item.product._id));
      await cart.save();

      res.status(200).json({ Ticket, notPurchased: productsNotPurchsed });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

function generateUniqueCode() {
    return Math.random().toString(36).substring(2,15);
}

function calculateTotalAmount(products) {
    return products.reduce((total, item)=> total + item.product.price * item.quantity, 0);

}

module.exports = router;