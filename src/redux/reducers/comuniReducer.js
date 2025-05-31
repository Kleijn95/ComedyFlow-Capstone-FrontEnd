const comuniReducer = (state = [], action) => {
  switch (action.type) {
    case "SET_COMUNI":
      return action.payload;
    default:
      return state;
  }
};

export default comuniReducer;
