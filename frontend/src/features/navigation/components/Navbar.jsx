import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectLoggedInUser, logoutAsync } from "../../auth/AuthSlice";
import { axiosi } from "../../../config/axios";

const NavbarIcon = ({ icon, badge = 0, isTransparent, to = "#" }) => {
  const iconColor = isTransparent ? "text-white" : "text-black";

  const icons = {
    search: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    ),
    heart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    ),
    user: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
    cart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293a1 1 0 00.707 1.707H17m0 0v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4"
      />
    ),
  };

  return (
    <div className="relative">
      <Link to={to} className="p-1">
        <svg
          className={`w-5 h-5 ${iconColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icons[icon]}
        </svg>
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-full font-bold">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    </div>
  );
};

export const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectLoggedInUser);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    if (isHome) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isHome]);

  const isTransparent = isHome && !scrolled;
  const bgClass = isTransparent ? "bg-transparent text-white" : "bg-white text-black";

  const handleLogout = () => {
    dispatch(logoutAsync()).then(() => {
      setMobileMenuOpen(false);
      navigate("/");
    });
  };

  return (
    <header
      className={`${isHome ? "fixed" : "relative"} top-0 left-0 w-full z-50 transition-all duration-300 ${bgClass}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-4">
        {/* Logo */}
        <div className="w-full flex justify-between items-center">
          <Link to={user?.isAdmin ? "/admin-dashboard" : "/"} className="text-center block">
            <h1
              className={`text-[36px] tracking-wide font-medium uppercase ${
                isTransparent ? "text-white" : "text-black"
              }`}
            >
              CEKIR
            </h1>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex gap-6 text-sm font-medium uppercase items-center">
            {!user?.isAdmin ? (
              <>
                <Link to="/categories/all" className="hover:text-gray-500">
                  New & Trending
                </Link>
                <Link to="/about-us" className="hover:text-gray-500">
                  About Us
                </Link>
                <Link to="/contact-us" className="hover:text-gray-500">
                  Contact
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin-dashboard" className="hover:text-gray-500">
                  Dashboard
                </Link>
                <Link to="/admin/add-product" className="hover:text-gray-500">
                  Add Product
                </Link>
                <Link to="/admin/add-category" className="hover:text-gray-500">
                  Add Category
                </Link>
                <Link to="/admin/orders" className="hover:text-gray-500">
                  Orders
                </Link>
              </>
            )}
          </nav>

          {/* Right Icons */}
          <div className="hidden lg:flex items-center space-x-4">
            <NavbarIcon icon="search" isTransparent={isTransparent} to="/search" />
            <NavbarIcon icon="heart" isTransparent={isTransparent} to="/wishlist" />
            <NavbarIcon icon="cart" isTransparent={isTransparent} to="/cart" />

            {/* Profile Dropdown */}
            {/* Profile Dropdown */}
<div className="relative">
  <button
    onClick={() => setProfileDropdown(!profileDropdown)}
    className="p-1"
    aria-label="Account"
  >
    <svg
      className={`w-5 h-5 ${isTransparent ? "text-white" : "text-black"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  </button>
  {profileDropdown && (
    <div className="absolute right-0 mt-2 bg-white shadow-xl border border-gray-100 rounded-md w-44 text-sm z-50 overflow-hidden text-black">
      {user ? (
        <>
          <Link
            to="/profile"
            className="block px-4 py-3 hover:bg-gray-100 border-b"
            onClick={() => setProfileDropdown(false)}
          >
            👤 Profile
          </Link>
          <Link
            to="/orders"
            className="block px-4 py-3 hover:bg-gray-100 border-b"
            onClick={() => setProfileDropdown(false)}
          >
            📦 Orders
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setProfileDropdown(false);
            }}
            className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-100"
          >
            🚪 Logout
          </button>
        </>
      ) : (
        <Link
          to="/login"
          className="block px-4 py-3 hover:bg-gray-100"
          onClick={() => setProfileDropdown(false)}
        >
          🔑 Login
        </Link>
      )}
    </div>
  )}
</div>

          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <X className={`w-6 h-6 ${isTransparent ? "text-white" : "text-black"}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isTransparent ? "text-white" : "text-black"}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white text-black w-full px-6 py-4 shadow-md space-y-4 text-sm font-medium uppercase">
          {!user?.isAdmin ? (
            <>
              <Link to="/categories/all" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                New & Trending
              </Link>
              <Link to="/about-us" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                About Us
              </Link>
              <Link to="/contact-us" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                Contact
              </Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                Wishlist
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                Cart
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                Dashboard
              </Link>
              <Link to="/admin/add-product" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                Add Product
              </Link>
              <Link to="/admin/add-category" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                Add Category
              </Link>
              <Link to="/admin/orders" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                Orders
              </Link>
            </>
          )}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                Profile
              </Link>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
                Orders
              </Link>
              <button onClick={handleLogout} className="block w-full text-left text-red-500 hover:text-red-700">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
