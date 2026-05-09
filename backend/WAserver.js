import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "https://www.thayilamfoods.com",
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

// ============================
// TEMP OTP STORE
// ============================

const otpStore = {};

// ============================
// HELPERS
// ============================

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

// ============================
// HOME
// ============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "WhatsApp OTP server running",
  });
});

// ============================
// SEND OTP
// ============================

app.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    const normalizedPhone = normalizePhone(phone);

    const otp = generateOTP();

    // Save OTP for 5 mins
    otpStore[normalizedPhone] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    console.log("OTP:", otp);

    // ============================
    // MSG91 WHATSAPP TEMPLATE API
    // ============================

    const payload = {
      integrated_number: process.env.MSG91_INTEGRATED_NUMBER,
      content_type: "template",
      payload: {
        messaging_product: "whatsapp",
        type: "template",
        template: {
          name: "auth", // YOUR TEMPLATE NAME
          language: {
            code: "en",
            policy: "deterministic"
          },
          namespace: process.env.MSG91_NAMESPACE,
          to_and_components: [
            {
              to: [normalizedPhone],
              components: {
                body_1: {
                  type: "text",
                  value: otp
                }
              }
            }
          ]
        }
      }
    };

    await axios.post(
      "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          authkey: process.env.MSG91_AUTHKEY,
        },
      }
    );

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

// ============================
// VERIFY OTP
// ============================

app.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP required",
      });
    }

    const normalizedPhone = normalizePhone(phone);

    const stored = otpStore[normalizedPhone];

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (Date.now() > stored.expires) {
      delete otpStore[normalizedPhone];

      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP SUCCESS
    delete otpStore[normalizedPhone];

    return res.json({
      success: true,
      verified: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
});

// ============================
// START SERVER
// ============================

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`WA Server running on port ${PORT}`);
});