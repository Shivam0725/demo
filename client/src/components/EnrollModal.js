import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const EnrollModal = ({ show, handleClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    country: 'India',
    mobile: '',
    email: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEnroll = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/enroll',
        formData
      );

      if (response.data.success) {
        setStep(2);
        setSuccess(response.data.message);
        console.log('Demo OTP:', response.data.otp || '000000');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/verify',
        { mobile: formData.mobile, otp }
      );
      
      if (response.data.success) {
        setStep(3); // Move to payment step after verification
      } else {
        setError(response.data.error || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
  setLoading(true);
  setError('');
  
  try {
    if (!window.Razorpay) {
      throw new Error('Payment system not available');
    }

    const orderResponse = await axios.post('http://localhost:5000/api/create-order', {
      amount: 50000, // ₹500 in paise
      currency: 'INR'
    });

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: orderResponse.data.amount,
      currency: 'INR',
      name: 'Course Enrollment',
      description: 'Introduction to Machine Learning',
      order_id: orderResponse.data.id,
      handler: async (response) => {
        try {
          const verifyResponse = await axios.post(
            'http://localhost:5000/api/verify-payment', 
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              userData: formData
            }
          );
          
          if (verifyResponse.data.success) {
            window.location.href = `/dashboard?name=${encodeURIComponent(formData.name)}`;
          }
        } catch (err) {
          setError('Payment verification failed');
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.mobile // Ensure this is an Indian number (+91)
      },
      theme: { color: '#3399cc' },
      notes: {
        course: 'Machine Learning'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    setError(error.message || 'Payment processing failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {step === 1 ? 'Enroll Now' : 
           step === 2 ? 'Verify OTP' : 
           'Complete Payment'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {step === 1 ? (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                pattern="[0-9]{10}"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Form>
        ) : step === 2 ? (
          <div>
            <p className="mb-3">We've sent an OTP to +91{formData.mobile}</p>
            <p className="text-muted small mb-3">DEMO MODE: Use OTP <strong>000000</strong></p>
            <Form.Group>
              <Form.Label>Enter OTP</Form.Label>
              <Form.Control
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
              />
            </Form.Group>
          </div>
        ) : (
          <div>
            <h5>Payment Summary</h5>
            <p>Course: Introduction to Machine Learning</p>
            <p>Amount: ₹500</p>
            <p>Click the button below to complete your payment</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={
            step === 1 ? handleEnroll : 
            step === 2 ? handleVerify : 
            handlePayment
          }
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : step === 1 ? 'Send OTP' : 
             step === 2 ? 'Verify OTP' : 
             'Proceed to Payment'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EnrollModal;