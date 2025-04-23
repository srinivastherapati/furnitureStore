import { useContext, useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import logoImg from "../assets/logo.jpg";
import CartContext from "./Store/CartContext.jsx";
import UserProgressContext from "./Store/UserProgressContext.jsx";
import "./Header.css";

export default function Header({ isAdmin, isLoggedIn, userData, onLogout, setCurrentPage }) {
  const crtCntxt = useContext(CartContext);
  const userProgressCtx = useContext(UserProgressContext);
  const cartValue = crtCntxt.items.reduce((totalItems, item) => totalItems + item.quantity, 0);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  function handleShowCart() {
    if (!isLoggedIn) {
      alert("Please login to continue!");
      setCurrentPage("products");
      return;
    }
    userProgressCtx.showCart();
  }

  return (
    <header id="main-header" className="header">
      {/* Left section with logo and title */}
      <div id="title" className="header-title">
        <img src={logoImg} alt="Store Logo" />
        <h1 className="header-link" onClick={() => setCurrentPage("products")}>
          Furniture Store
        </h1>
      </div>

      {/* Right section with navigation links and user menu */}
      <nav className="header-nav">
        <Button
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          Menu
        </Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{ 'aria-labelledby': 'basic-button' }}
        >
          {isAdmin && <MenuItem onClick={() => { setCurrentPage("all-orders"); handleClose(); }}>Orders</MenuItem>}
          {isAdmin && <MenuItem onClick={() => { setCurrentPage("all-users"); handleClose(); }}>Users</MenuItem>}
          {isLoggedIn && !isAdmin && <MenuItem onClick={() => { setCurrentPage("your-orders"); handleClose(); }}>Your Orders</MenuItem>}
          {!isAdmin && (
            <MenuItem onClick={() => { handleShowCart(); handleClose(); }}>
              Cart ({cartValue}) <ShoppingCartIcon sx={{ marginLeft: "8px" }} />
            </MenuItem>
          )}
          {!isLoggedIn ? (
            <MenuItem onClick={() => { setCurrentPage("login"); handleClose(); }}>Login</MenuItem>
          ) : (
            <MenuItem onClick={() => { onLogout(); handleClose(); }}>
              Logout <LogoutIcon sx={{ marginLeft: "8px" }} />
            </MenuItem>
          )}
        </Menu>
      </nav>
    </header>
  );
}
