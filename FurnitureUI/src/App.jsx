import React, { useState, useEffect } from "react";
import LoginPage from "./Components/LoginPage";
import Cart from "./Components/Cart";
import Checkout from "./Components/Checkout";
import Header from "./Components/Header";
import Meals from "./Components/Meals";
import CustomerOrders from "./Components/CustomerOrders";
import AllOrders from "./Components/AllOrders";
import AllUsers from "./Components/AllUsers";
import { CartContextProvider } from "./Components/Store/CartContext";
import ManageManagers from "./Components/ManageManagers";
import { UserProgressContextProvider } from "./Components/Store/UserProgressContext";

function App() {
  const [currentPage, setCurrentPage] = useState("products");
  const [loggedIn, setLoggedIn] = useState(false);

  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userDetails"))
  );

  useEffect(() => {
    if (userData === null) {
      setLoggedIn(false);
    }
  }, [userData]);

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    setLoggedIn(isLoggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
    setLoggedIn(false);
  };

  // if (!loggedIn) {
  //   return <LoginPage setUserData={setUserData} setLoggedIn={setLoggedIn} />;
  // }

  const mainContainerStyle = {
    display: "flex",
    height: "100vh",
  };

  return (
    <UserProgressContextProvider>
      <CartContextProvider>
        {currentPage !== "login" && (
          <div style={mainContainerStyle}>
            <div style={{ width: "100%" }}>
              <Header
                isLoggedIn={loggedIn}
                role={userData?.role}
                userData={userData}
                onLogout={handleLogout}
                setCurrentPage={setCurrentPage}
              />
              {currentPage == "products" && (
                <Meals
                  role={ userData?.role }
                  isLoggedIn={loggedIn}
                  setCurrentPage={setCurrentPage}
                />
              )}
              {userData &&
              userData.role==="admin" &&
              currentPage === "manage-managers" && <ManageManagers />}

              {userData &&
                userData.role === "customer" &&
                currentPage == "your-orders" && <CustomerOrders />}
              {userData &&
                userData.role === "admin" &&
                currentPage == "all-orders" && <AllOrders />}
              {userData &&
                userData.role === "admin" &&
                currentPage == "all-users" && <AllUsers />}
              <Cart />
              {userData && <Checkout />}
            </div>
          </div>
        )}
        {currentPage == "login" && (
          <LoginPage setUserData={setUserData} setLoggedIn={setLoggedIn} />
        )}
      </CartContextProvider>
    </UserProgressContextProvider>
  );
}

export default App;
