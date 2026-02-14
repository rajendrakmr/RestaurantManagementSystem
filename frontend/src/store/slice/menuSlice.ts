import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MenuState {
  items: any[];
}

const initialState: MenuState = {
  items: [],
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenu: (state, action: PayloadAction<any>) => {
      console.log('action.payloa',action.payload)  
      return {
        items:  action.payload,
      };
    },
    clearMenu: (state) => {
      state.items = [];
    },
  },
});

export const { setMenu, clearMenu } = menuSlice.actions;
export default menuSlice.reducer;
