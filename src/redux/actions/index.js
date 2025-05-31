const SET_USER = "SET_USER";
const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGIN_FAILURE = "LOGIN_FAILURE";
const LOGOUT = "LOGOUT";

export { SET_USER, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT };

const apiUrl = import.meta.env.VITE_API_URL;

export const fetchLogin = (username, password) => {
  return async (dispatch) => {
    try {
      const response = await fetch(apiUrl + "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (response.ok && data?.token) {
        dispatch({ type: LOGIN_SUCCESS, payload: data });
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        return { success: true };
      } else {
        dispatch({ type: LOGIN_FAILURE, payload: data });

        const ruoloNotApproved = (data?.error || data?.message || "").includes("non è stato ancora approvato");
        const mailNotVerified = data?.message?.toLowerCase().includes("mail non verificata");

        return {
          success: false,
          error: data?.message || "Username o password errati",
          ruoloNotApproved,
          mailNotVerified,
        };
      }
    } catch (error) {
      console.error("Errore nel login:", error);
      dispatch({
        type: LOGIN_FAILURE,
        payload: { error: "Errore di rete" },
      });
      return {
        success: false,
        error: "Errore di rete: riprova più tardi",
      };
    }
  };
};

export const fetchUserDetails = (token) => {
  return async (dispatch) => {
    try {
      const response = await fetch(apiUrl + "/utenti/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data) {
        dispatch({ type: SET_USER, payload: data });
      } else {
        localStorage.removeItem("token");
        dispatch({ type: LOGOUT });
      }
    } catch (error) {
      console.error("Errore nel recupero dell'utente:", error);
      localStorage.removeItem("token");
      dispatch({ type: LOGOUT });
    }
  };
};

export const fetchComuni = (token) => async (dispatch) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/comuni`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Errore fetch comuni");
    const data = await res.json();
    dispatch({ type: "SET_COMUNI", payload: data });
  } catch (error) {
    console.error(error);
  }
};
