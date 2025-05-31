import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import store from "../redux/store";
import App from "../App";

describe("App component", () => {
  it("renders the navbar", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const navElement = screen.getByText(/logout|home|dashboard/i);
    expect(navElement).toBeInTheDocument();
  });
});
