import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Button, 
  Stack, 
  Paper, 
  Container 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { axiosi } from "../../../config/axios";

const PaymentProcessing = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      
      if (!sessionId) {
        setError('Invalid session ID');
        setStatus('failed');
        return;
      }
      
      try {
        // Poll payment status
        const checkStatus = async () => {
          try {
            const response = await axiosi.get(`/api/checkout/verify-payment?sessionId=${sessionId}`);
            
            if (response.data.success) {
              if (response.data.paid) {
                if (response.data.orderId) {
                  // Payment successful and order created
                  setOrderId(response.data.orderId);
                  setStatus('success');
                  // Wait a moment then redirect
                  setTimeout(() => {
                    navigate(`/order-success/${response.data.orderId}`);
                  }, 2000);
                } else if (response.data.processing) {
                  // Order is still being processed, check again
                  setTimeout(checkStatus, 2000);
                }
              } else {
                // Payment not completed
                setStatus('failed');
                setError('Payment was not completed');
              }
            } else {
              setStatus('failed');
              setError(response.data.message || 'Failed to verify payment');
            }
          } catch (err) {
            console.error('Error checking payment status:', err);
            // If we get an error, wait and try again
            setTimeout(checkStatus, 3000);
          }
        };
        
        // Start checking
        checkStatus();
      } catch (err) {
        console.error('Error verifying payment', err);
        setStatus('failed');
        setError('Failed to verify payment status');
      }
    };
    
    verifyPayment();
  }, [location.search, navigate]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          {status === 'processing' && (
            <>
              <CircularProgress size={60} />
              <Typography variant="h4">Processing Your Payment</Typography>
              <Typography color="text.secondary">
                Please wait while we verify your payment status. This might take a few moments...
              </Typography>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
              <Typography variant="h4">Payment Successful!</Typography>
              <Typography color="text.secondary">
                Your order has been placed successfully. Redirecting you to the order confirmation page...
              </Typography>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <ErrorIcon color="error" sx={{ fontSize: 60 }} />
              <Typography variant="h4">Payment Failed</Typography>
              <Typography color="error">
                {error || 'There was an issue processing your payment.'}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate('/cart')}
                >
                  Return to Cart
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentProcessing;
