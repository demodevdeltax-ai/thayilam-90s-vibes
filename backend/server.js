import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";

const app = express();

// IMPORTANT
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Razorpay backend running",
  });
});

app.post("/create-order", async (req, res) => {
  try {

    const { items } = req.body;

    // TODO:
    // calculate total from DB products

    const amount = 50000;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    return res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment not captured",
      });
    }

    return res.json({
      success: true,
      payment,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

// =========================================
// WEBHOOK
// =========================================

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    try {
      const webhookSignature = req.headers["x-razorpay-signature"];

      const expectedSignature = crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_WEBHOOK_SECRET
        )
        .update(req.body.toString())
        .digest("hex");

      if (expectedSignature !== webhookSignature) {
        return res.status(400).json({
          success: false,
          message: "Invalid webhook signature",
        });
      }

      const payload = JSON.parse(req.body.toString());

      console.log("Webhook event:", payload.event);

      // Handle events here
      // payment.captured
      // order.paid

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false });
    }
  }
);

export default app;