const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

router.post('/create-checkout-session', authenticateUser, async (req, res) => {
    const { mongoId, email } = req.user;

    const customer = await stripe.customers.create({
        email,
        metadata: {userId: mongoId.toString()}
    });

    await User.findByIdAndUpdate(mongoId, {stripeCustomerId: customer.id})

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email, 
        line_items: [
        {
            price: 'price_1RlZdUPbhQKh6XpFjIsIo7Xe', 
            quantity: 1,
        },
        ],
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/style',
        metadata: {
            userId: mongoId.toString(), 
        },
    });

    res.json({ url: session.url });
});

router.post('/create-customer-portal-session', authenticateUser, async (req, res) => {
    const { mongoId } = req.user;

    const user = await User.findById(mongoId);
    if (!user.stripeCustomerId) return res.status(400).json({ error: 'No Stripe customer found' });

    const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: 'http://localhost:3000/settings',
    });

    res.json({ url: session.url });
});

module.exports = router;