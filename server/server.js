require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const User = require('./models/User');

const app = express();

// Enhanced Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5001',
    'https://your-vercel-frontend.vercel.app' // Add your production frontend URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Robust MongoDB Connection with error handling
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
  });
};
connectWithRetry();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_FjJLLJmixjfKEP',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'HRnY7p91cKkTCA2wvvPXnWQa'
});

// Demo Mode Flag
const DEMO_MODE = true;

// Hugging Face Configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const HF_API_KEY = process.env.HF_API_KEY;

// Keep-alive ping for Render free tier
const pingSelf = () => {
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      axios.get(`http://localhost:${process.env.PORT || 10000}/health`)
        .catch(err => console.log('Keep-alive ping failed:', err.message));
    }, 5 * 60 * 1000); // Every 5 minutes
  }
};

// Routes (All existing routes preserved exactly as they were)
app.post('/api/enroll', async (req, res) => {
  try {
    console.log('Received enrollment data:', req.body);
    
    const { name, country, mobile, email } = req.body;
    if (!name || !mobile || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const otp = '000000'; // Hardcoded for demo
    const user = new User({
      name,
      country,
      mobile,
      email,
      otp,
      otpExpires: new Date(Date.now() + 5 * 60000)
    });

    await user.save();
    console.log('User saved successfully:', user);

    res.json({ 
      success: true,
      message: 'DEMO MODE: Use OTP 000000',
      otp
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/verify', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const user = await User.findOne({ 
      mobile,
      otp: DEMO_MODE ? '000000' : otp,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired OTP' 
      });
    }

    user.isVerified = true;
    await user.save();

    res.json({ 
      success: true, 
      name: user.name,
      message: 'Verification successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/create-order', async (req, res) => {
  try {
    const options = {
      amount: 50000, // 500 Rs
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, ...order });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userData } = req.body;
    
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'HRnY7p91cKkTCA2wvvPXnWQa');
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    
    if (generated_signature === razorpay_signature) {
      const user = await User.findOneAndUpdate(
        { email: userData.email, mobile: userData.mobile },
        {
          paymentId: razorpay_payment_id,
          paymentStatus: 'completed',
          amountPaid: 500,
          isVerified: true
        },
        { new: true }
      );
      
      res.json({ 
        success: true, 
        message: 'Payment verified and enrollment completed',
        name: user.name
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Payment verification failed' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/summarize-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text.substring(0, 10000); // First 10k chars

    // Hugging Face API call
    const response = await axios.post(
      HF_API_URL,
      { inputs: text },
      { 
        headers: { 
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    if (!response.data || !response.data[0] || !response.data[0].summary_text) {
      throw new Error('Empty response from Hugging Face API');
    }

    res.json({ 
      summary: response.data[0].summary_text,
      model: "facebook/bart-large-cnn",
      chars_processed: text.length 
    });
  } catch (error) {
    console.error('Summarization error:', error);
    
    let errorMsg = 'Failed to generate summary';
    let solution = 'Try a smaller PDF or check your Hugging Face token';
    
    if (error.response) {
      errorMsg = error.response.data?.error || errorMsg;
      if (error.response.status === 503) {
        solution = 'Model is loading, try again in a few seconds';
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMsg = 'Request timed out';
    }

    res.status(500).json({ 
      error: errorMsg,
      details: error.message,
      solution: solution
    });
  }
});

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Server setup with Render optimizations
const PORT = process.env.PORT || 10000; // Render requires 10000 for free tier
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (DEMO MODE)`);
  pingSelf(); // Start keep-alive pings
});

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Server and MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;