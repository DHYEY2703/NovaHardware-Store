import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  countInStock: number;
}

interface CartItem extends Product {
  qty: number;
}

interface CartState {
  cartItems: CartItem[];
  shippingAddress: any;
  paymentMethod: string;
}

const initialState: CartState = {
  cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')!) : [],
  shippingAddress: {},
  paymentMethod: 'Stripe',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) => x._id === existItem._id ? item : x);
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    }
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
