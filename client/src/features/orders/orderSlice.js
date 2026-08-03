import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { clearCartLocal } from '../cart/cartSlice';

// Async Thunks
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/orders/create', orderData);
      dispatch(clearCartLocal()); // Clear local Redux cart
      return response.data;
    } catch (error) {
      const errData = error.response?.data;
      const validationMsg = errData?.errors?.[0]?.message;
      return rejectWithValue(validationMsg || errData?.message || 'Failed to place order');
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'orders/validateCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const response = await api.post('/coupons/validate', { code });
      // Backend returns { success, data: { code, discountPct, discountAmount, ... } }
      const payload = response.data?.data || response.data;
      return { code, discountPct: payload.discountPct };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon code');
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      const userId = getState().auth.user?._id;
      if (!userId) {
        return rejectWithValue('Not authenticated');
      }

      const response = await api.get(`/orders/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load order history');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/single/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Order not found');
    }
  }
);


export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const cancelUserOrder = createAsyncThunk(
  'orders/cancelUser',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

const initialState = {
  list: [],
  currentOrder: null,
  activeCoupon: null,
  couponError: null,
  loading: false,
  error: null,
  success: false,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderState: (state) => {
      state.success = false;
      state.error = null;
      state.currentOrder = null;
    },
    clearCoupon: (state) => {
      state.activeCoupon = null;
      state.couponError = null;
    },
    updateOrderStatusInList: (state, action) => {
      const { orderId, status, paymentStatus } = action.payload;
      const order = state.list.find((o) => o._id === orderId);
      if (order) {
        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
      }
      if (state.currentOrder?._id === orderId) {
        if (status) state.currentOrder.status = status;
        if (paymentStatus) state.currentOrder.paymentStatus = paymentStatus;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data;
        state.currentOrder = data?.order ?? (data?._id ? data : null) ?? action.payload?.order ?? null;
        state.success = true;
        state.activeCoupon = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Validate Coupon
      .addCase(validateCoupon.pending, (state) => {
        state.couponError = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.activeCoupon = action.payload;
        state.couponError = null;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.activeCoupon = null;
        state.couponError = action.payload;
      })

      // Fetch All User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { success, data: [...orders] }
        const raw = action.payload?.data;
        state.list = Array.isArray(raw) ? raw : (action.payload?.orders ?? []);
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Order By Id
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data;
        state.currentOrder = data?.order ?? (data?._id ? data : null) ?? action.payload?.order ?? null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // Cancel Order (User/Admin via cancelOrder)
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload?.order || action.payload?.data;
        if (updatedOrder) {
          const orderId = updatedOrder._id || updatedOrder.orderId;
          const status = updatedOrder.status || 'cancelled';
          const history = updatedOrder.history || updatedOrder.statusHistory;
          
          const index = state.list.findIndex((o) => String(o._id) === String(orderId));
          if (index !== -1) {
            state.list[index].status = status;
            if (history) state.list[index].statusHistory = history;
          }
          if (state.currentOrder && String(state.currentOrder._id) === String(orderId)) {
            state.currentOrder.status = status;
            if (history) state.currentOrder.statusHistory = history;
          }
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel User Order (via cancelUserOrder)
      .addCase(cancelUserOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelUserOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload?.order || action.payload?.data;
        if (updatedOrder) {
          const orderId = updatedOrder._id || updatedOrder.orderId;
          const status = updatedOrder.status || 'cancelled';
          const history = updatedOrder.history || updatedOrder.statusHistory;

          const index = state.list.findIndex((o) => String(o._id) === String(orderId));
          if (index !== -1) {
            state.list[index].status = status;
            if (history) state.list[index].statusHistory = history;
          }
          if (state.currentOrder && String(state.currentOrder._id) === String(orderId)) {
            state.currentOrder.status = status;
            if (history) state.currentOrder.statusHistory = history;
          }
        }
      })
      .addCase(cancelUserOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearOrderState, clearCoupon, updateOrderStatusInList } = orderSlice.actions;
export default orderSlice.reducer;
