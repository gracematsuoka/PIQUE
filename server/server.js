const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const User = require('./models/User');

const app = express();

app.use(cors({ origin: ['http://localhost:3000','https://pique-ten.vercel.app'], credentials: true }));

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
 
  let event;

  try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  let customerId;
  switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        customerId = session.customer;

        const mongoId = session.metadata.userId;
        await User.findByIdAndUpdate(mongoId, {plus: true, stripeCustomerId: customerId});

        console.log('Payment succeeded!');
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        customerId = subscription.customer;

        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          user.plus = false;
          await user.save();
          console.log(`Subscription canceled. User ${user._id} downgraded.`);
        }
        break;

      default:
          console.log(`Unhandled event type ${event.type}`);
          break;
  }

  res.json({ received: true });
});

app.use(express.json());

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const imageRoutes = require('./routes/images');
app.use('/api/images', imageRoutes);

const userItemRoutes = require('./routes/useritems');
app.use('/api/useritems', userItemRoutes);

const ItemRoutes = require('./routes/items');
app.use('/api/items', ItemRoutes);

const PostRoutes = require('./routes/posts');
app.use('/api/posts', PostRoutes);

const BoardRoutes = require('./routes/boards');
app.use('/api/boards', BoardRoutes);

const FollowRoutes = require('./routes/follows');
app.use('/api/follows', FollowRoutes);

const boardPostRoutes = require('./routes/boardposts');
app.use('/api/boardposts', boardPostRoutes);

const tagRoutes = require('./routes/tags');
app.use('/api/tags', tagRoutes);

const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

const plusRoutes = require('./routes/plus');
app.use('/api/plus', plusRoutes);

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })