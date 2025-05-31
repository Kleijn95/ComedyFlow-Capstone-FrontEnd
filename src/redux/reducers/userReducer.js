import { LOGOUT, SET_USER } from "../actions";

const userReducer = (state = { user: null }, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case LOGOUT:
      return { ...state, user: null };
    default:
      return state;
  }
};
export default userReducer;
