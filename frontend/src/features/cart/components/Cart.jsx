import React, { useEffect } from 'react';
import {
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

import {
  resetCartItemRemoveStatus,
  selectCartItemRemoveStatus,
  selectCartItems,
  deleteCartItemByIdAsync
} from '../CartSlice';

import { SHIPPING, TAXES } from '../../../constants';

export const Cart = ({ checkout }) => {
  const items = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const cartItemRemoveStatus = useSelector(selectCartItemRemoveStatus);

  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));

  const validItems = items.filter(item => item?.variant && item?.variant?.price != null);
  const subtotal = validItems.reduce((acc, item) => {
    const price = item?.variant?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const totalItems = validItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (items.length === 0 || validItems.length === 0) {
      toast.info('Your cart is empty. Add items to proceed.');
    }
  }, [items, validItems.length]);

  useEffect(() => {
    if (cartItemRemoveStatus === 'fulfilled') {
      toast.success('Product removed from cart');
    } else if (cartItemRemoveStatus === 'rejected') {
      toast.error('Error removing product from cart, please try again later');
    }
  }, [cartItemRemoveStatus]);

  useEffect(() => {
    dispatch(resetCartItemRemoveStatus());
  }, [dispatch]);

  if (validItems.length === 0) {
    return (
      <Stack justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Button variant="contained" component={Link} to="/">
          Continue Shopping
        </Button>
      </Stack>
    );
  }

  return (
    <Stack justifyContent="flex-start" alignItems="center" mb="5rem">
      <Stack width={is900 ? 'auto' : '50rem'} mt="3rem" pl={checkout ? 0 : 2} pr={checkout ? 0 : 2} rowGap={4}>
        {/* Cart Items */}
        <Stack rowGap={2}>
          {validItems.map(item => {
            const product = item.variant.product;
            const options = item.variant.optionValues || {};

            return (
              <Paper
                key={item._id}
                sx={{
                  p: 2,
                  border: '1px solid #eee',
                  borderRadius: 2,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <img
                 src={item.variant.images?.[0] || '/placeholder.png'}
                  alt={product?.name}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #ccc' }}
                />
                <Stack flex={1} spacing={0.5}>
                  <Typography fontWeight={500}>{product?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Color: {options.Color || '-'} | Size: {options.Size || '-'}
                  </Typography>
                  <Typography variant="body2">
                    AED {item.variant.price} x {item.quantity} = <strong>AED {(item.variant.price * item.quantity).toFixed(2)}</strong>
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => dispatch(deleteCartItemByIdAsync(item._id))}
                >
                  Remove
                </Button>
              </Paper>
            );
          })}
        </Stack>

        {/* Subtotal Section */}
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          {checkout ? (
            <Stack rowGap={2} width="100%">
              <Stack flexDirection="row" justifyContent="space-between">
                <Typography>Subtotal</Typography>
                <Typography>AED {subtotal.toFixed(2)}</Typography>
              </Stack>
              <Stack flexDirection="row" justifyContent="space-between">
                <Typography>Shipping</Typography>
                <Typography>AED {SHIPPING}</Typography>
              </Stack>
              <Stack flexDirection="row" justifyContent="space-between">
                <Typography>Taxes</Typography>
                <Typography>AED {TAXES}</Typography>
              </Stack>
              <hr />
              <Stack flexDirection="row" justifyContent="space-between">
                <Typography fontWeight="bold">Total</Typography>
                <Typography fontWeight="bold">
                  AED {(subtotal + SHIPPING + TAXES).toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <>
              <Stack>
                <Typography variant="h6" fontWeight={500}>Subtotal</Typography>
                <Typography>Total items: {totalItems}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Shipping and taxes calculated at checkout.
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="h6" fontWeight={500}>
                  AED {subtotal.toFixed(2)}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>

        {/* Buttons */}
        {!checkout && (
          <Stack rowGap="1rem">
            <Button variant="contained" component={Link} to="/checkout">Checkout</Button>
            <motion.div style={{ alignSelf: 'center' }} whileHover={{ y: 2 }}>
              <Chip sx={{ cursor: 'pointer', borderRadius: '8px' }} component={Link} to="/" label="or continue shopping" variant="outlined" />
            </motion.div>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
