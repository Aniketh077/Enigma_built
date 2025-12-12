import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  Phone,
  Heart,
} from "lucide-react";
import Button from "../ui/Button";
import { fetchCollections } from "../../store/slices/collectionSlice";
import { fetchCollections as fetchCollectionsWithTypes } from "../../store/slices/productSlice";
import SellerModal from "../SellerModal/SellerModal";

const Header = () => {
  const headerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For mobile menu
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolledNavOpen, setIsScrolledNavOpen] = useState(false); // For scrolled desktop menu
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuBreakpoint, setIsMobileMenuBreakpoint] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const menuCloseTimeoutRef = useRef(null);

  const { cart } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const scrolledNavRef = useRef(null);
  const dispatch = useDispatch();
  const { collections } = useSelector((state) => state.collections);
  const { collections: collectionsWithTypes } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchCollections({ includeInactive: false }));
    dispatch(fetchCollectionsWithTypes());
  }, [dispatch]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const toggleScrolledNav = () => setIsScrolledNavOpen(!isScrolledNavOpen);

  const handleProfileMenuEnter = () => {
    clearTimeout(menuCloseTimeoutRef.current);
    setIsProfileMenuOpen(true);
  };

  const handleProfileMenuLeave = () => {
    menuCloseTimeoutRef.current = setTimeout(() => {
      setIsProfileMenuOpen(false);
    }, 200);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    navigate("/");
  };

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileMenuBreakpoint(window.innerWidth < 1024); // Adjusted breakpoint for new layout
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (window.scrollY <= 50) {
        setIsScrolledNavOpen(false); // Close scrolled nav when returning to top
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
    setActiveDropdown(null);
    setIsScrolledNavOpen(false);
  }, [location]);

  // Handle clicking outside of menus to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        isScrolledNavOpen &&
        scrolledNavRef.current &&
        !scrolledNavRef.current.contains(event.target)
      ) {
        setIsScrolledNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen, isScrolledNavOpen]);

  // Set CSS variable --header-height so pages can offset the fixed header
  useEffect(() => {
    const updateHeaderHeight = () => {
      try {
        const h = headerRef.current ? headerRef.current.offsetHeight : 0;
        document.documentElement.style.setProperty('--header-height', `${h}px`);
      } catch (err) {
        // ignore
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [isMobileMenuBreakpoint, isScrolled, isMenuOpen, isScrolledNavOpen]);

  // Create dynamic menu helper
  const getCollectionMenu = (collectionName) => {
    const collection = Array.isArray(collections)
      ? collections.find(c => {
          if (!c || typeof c !== 'object' || !c.name) return false;
          return String(c.name).toLowerCase() === collectionName.toLowerCase();
        })
      : null;

    const collectionWithTypes = Array.isArray(collectionsWithTypes)
      ? collectionsWithTypes.find(c => {
          if (!c || typeof c !== 'object' || !c.name) return false;
          return String(c.name).toLowerCase() === collectionName.toLowerCase();
        })
      : null;

    const types = [];
    if (collectionWithTypes && Array.isArray(collectionWithTypes.types)) {
      collectionWithTypes.types.slice(0, 3).forEach(type => {
        if (type && typeof type === 'object' && type.name) {
          const typeName = String(type.name);
          if (typeName) {
            types.push({
              name: typeName,
              path: `/products?types=${encodeURIComponent(typeName)}`
            });
          }
        }
      });
    }

    const conditions = [
      { name: "Like New", path: "/products?condition=Like+New" },
      { name: "Excellent", path: "/products?condition=Excellent" },
      { name: "Good", path: "/products?condition=Good" },
    ];

    const images = types.slice(0, 2).map(type => ({
      name: type.name,
      path: type.path,
      src: (collection && collection.image) ? String(collection.image) : "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg",
      alt: `Refurbished ${type.name}`
    }));

    return { types, conditions, images };
  };

  // Navigation menu data
  const smartphonesMenu = getCollectionMenu('Smartphones');
  const laptopsMenu = getCollectionMenu('Laptops');

  // Use dynamic menus or fallback to popular brands
  const activeSmartphonesMenu = smartphonesMenu.types && smartphonesMenu.types.length > 0 ? smartphonesMenu : {
    types: [
      { name: "Apple iPhone", path: "/products/smartphones?search=Apple" },
      { name: "Samsung Galaxy", path: "/products/smartphones?search=Samsung" },
      { name: "OnePlus", path: "/products/smartphones?search=OnePlus" },
      { name: "Google Pixel", path: "/products/smartphones?search=Google" },
      { name: "Xiaomi", path: "/products/smartphones?search=Xiaomi" }
    ],
    conditions: [
      { name: "Like New", path: "/products/smartphones?condition=Like+New" },
      { name: "Excellent", path: "/products/smartphones?condition=Excellent" },
      { name: "Good", path: "/products/smartphones?condition=Good" },
    ],
    images: [
      {
        name: "Premium Smartphones",
        path: "/products/smartphones?condition=Like+New",
        src: "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg",
        alt: "Refurbished Premium Smartphones"
      },
      {
        name: "Budget Friendly",
        path: "/products/smartphones?condition=Good",
        src: "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg",
        alt: "Affordable Refurbished Phones"
      }
    ]
  };

  const activeLaptopsMenu = laptopsMenu.types && laptopsMenu.types.length > 0 ? laptopsMenu : {
    types: [
      { name: "Apple MacBook", path: "/products/laptops?search=Apple" },
      { name: "Dell", path: "/products/laptops?search=Dell" },
      { name: "HP", path: "/products/laptops?search=HP" },
      { name: "Lenovo", path: "/products/laptops?search=Lenovo" },
      { name: "ASUS", path: "/products/laptops?search=ASUS" }
    ],
    images: [
      {
        name: "Premium Laptops",
        path: "/products/laptops?condition=Like+New",
        src: "https://images.pexels.com/photos/18105/pexels-photo.jpg",
        alt: "Refurbished Premium Laptops"
      },
      {
        name: "Business Laptops",
        path: "/products/laptops?search=business",
        src: "https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg",
        alt: "Refurbished Business Laptops"
      }
    ]
  };

  const DesktopNavLinks = () => (
    <ul className="flex items-center justify-center space-x-6 xl:space-x-8">
      <li>
        <Link to="/" className="text-sm font-medium transition-colors hover:text-emerald-600 text-[#01364a]">
          Home
        </Link>
      </li>
      <li>
        <Link to="/products" className="text-sm font-medium transition-colors hover:text-emerald-600 text-[#01364a]">
          All Products
        </Link>
      </li>
      <li className="relative group">
        <Link to="/products/smartphones" className="text-sm font-medium transition-colors hover:text-emerald-600 text-[#01364a] flex items-center">
          Smartphones
          <ChevronDown className="ml-1 h-3 w-3 relative top-[3px]" />
        </Link>
        <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-md p-6 z-50 transition-all duration-300 transform opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2" style={{ minWidth: "500px" }}>
          <div className="flex justify-between items-start space-x-8">
            <div className="flex-1">
              <h4 className="font-semibold text-base mb-4 text-[#01364a]">Explore Smartphones</h4>
              <div className="grid grid-cols-2 gap-4">
                {activeSmartphonesMenu.images.map((image) => (
                  <Link to={image.path} key={image.name} className="block text-center hover:opacity-90 transition-opacity group/item">
                    <div className="w-full h-32 flex items-center justify-center rounded-md overflow-hidden bg-gray-50">
                      <img src={image.src} alt={image.alt} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-2 group-hover/item:text-emerald-600">{image.name}</p>
                  </Link>
                ))}
              </div>
              <Link to="/products/smartphones" className="block mt-4 text-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
                View All Smartphones →
              </Link>
            </div>
          </div>
        </div>
      </li>
      <li className="relative group">
        <Link to="/products/laptops" className="text-sm font-medium transition-colors hover:text-emerald-600 text-[#01364a] flex items-center">
          Laptops <ChevronDown className="ml-1 h-3 w-3 relative top-[3px]" />
        </Link>
        <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-md p-6 z-50 transition-all duration-300 transform opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2" style={{ minWidth: "500px" }}>
          <div className="flex justify-between items-start space-x-8">
            <div className="flex-1">
              <h4 className="font-semibold text-base mb-4 text-[#01364a]">Explore Laptops</h4>
              <div className="grid grid-cols-2 gap-4">
                {activeLaptopsMenu.images.map((image) => (
                  <Link to={image.path} key={image.name} className="block text-center hover:opacity-90 transition-opacity group/item">
                    <div className="w-full h-32 flex items-center justify-center rounded-md overflow-hidden bg-gray-50">
                      <img src={image.src} alt={image.alt} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-2 group-hover/item:text-emerald-600">{image.name}</p>
                  </Link>
                ))}
              </div>
              <Link to="/products/laptops" className="block mt-4 text-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
                View All Laptops →
              </Link>
            </div>
          </div>
        </div>
      </li>
      <li><Link to="/products?filter=new" className="text-sm font-medium transition-colors hover:text-emerald-600 text-[#01364a]">New Arrivals</Link></li>
      <li><Link to="/products?filter=featured" className="text-sm font-medium transition-colors hover:text-emerald-600 text-[#01364a]">Featured Products</Link></li>
      <li><Link to="/about" className="text-sm font-medium transition-colors hover:text-emerald-600 text-[#01364a]">About</Link></li>
      <li><Link to="/contact" className="text-sm font-medium transition-colors hover:text-emerald-600 text-[#01364a]">Contact</Link></li>
    </ul>
  );

  return (
    <header ref={headerRef} className="fixed top-0 z-50 w-full bg-white shadow-md transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Top Bar (Logo, Search, Icons) --- */}
       {/* --- Top Bar (Logo, Search, Icons) --- */}
        <div className="flex items-center justify-between py-3 sm:py-4">

          {/* === LEFT SECTION: Mobile Menu & Logo / Desktop Logo & Scrolled Nav === */}
          <div className="flex justify-start items-center lg:w-auto">
             {/* Mobile Menu Toggle */}
             <button className="lg:hidden p-3 -ml-2 text-[#01364a] hover:bg-gray-100 rounded-md transition-colors" onClick={toggleMenu} aria-label="Open mobile menu">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </button>
             {/* MOBILE LOGO MOVED HERE */}
             <Link to="/" className="lg:hidden flex items-center flex-shrink-0 space-x-2">
  <img 
    src="/logo_light.png" 
    alt="Reeown Logo" 
    className="h-8 w-8 object-contain"
  />
  <span className="text-2xl font-bold text-[#01364a]">
    Ree<span className="text-green-600">own</span>
  </span>
</Link>

             {/* Desktop Left Content */}
             <div className="hidden lg:flex items-center space-x-4">
                {isScrolled && (
                    <button onClick={toggleScrolledNav} className="p-2 -ml-2 rounded-full hover:bg-gray-100" aria-label="Open navigation menu">
                        {isScrolledNavOpen ? <X className="h-6 w-6 text-[#01364a]" /> : <Menu className="h-6 w-6 text-[#01364a]" />}
                    </button>
                )}
                <Link to="/" className="flex items-center flex-shrink-0">
                  <span className="text-2xl font-bold text-[#01364a]">Ree<span className="text-green-600">own</span></span>
                </Link>
             </div>
          </div>

          {/* === CENTER SECTION: Desktop Search (Mobile logo removed) === */}
          <div className="hidden lg:flex lg:flex-1 lg:px-8 lg:w-auto justify-center">
             {/* Desktop Search Bar */}
             <div className="w-full">
                <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 border border-gray-300 rounded-md pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#01364a]"
                    />
                    <button type="submit" className="absolute right-0 top-0 h-full w-12 flex items-center justify-center bg-[#01364a] hover:bg-opacity-90 rounded-r-md" aria-label="Search">
                        <Search className="h-5 w-5 text-white" />
                    </button>
                </form>
             </div>
          </div>
          
          {/* === RIGHT SECTION: Icons & Desktop Contact === */}
          <div className="flex items-center justify-end space-x-2 md:space-x-4 lg:w-auto flex-1">
           <div className="hidden lg:block text-right">
  <p className="text-sm font-semibold text-[#01364a] whitespace-nowrap">
    <a href="tel:8861009443" className="flex items-center justify-end hover:underline">
      <Phone width={3} className="h-3 w-3 mr-1 mt-1 " />
      <span>8861009443</span>
    </a>
  </p>
  <p className="text-xs text-[#01374ae1]">Mon - Sat | 8am - 8pm</p>
</div>

             <button
               onClick={() => setIsSellerModalOpen(true)}
               className="hidden lg:flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors whitespace-nowrap"
             >
               Join as Seller
             </button>

             <Link to="/wishlist" className="relative p-2 sm:p-3 text-[#01364a] hover:text-red-500 hover:bg-gray-100 rounded-md transition-colors" aria-label="Wishlist">
                <Heart className="h-6 w-6" />
                {user && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {user.wishlist?.length || 0}
                    </span>
                )}
             </Link>

             <Link to="/cart" className="relative p-2 sm:p-3 text-[#01364a] hover:text-emerald-600 hover:bg-gray-100 rounded-md transition-colors" aria-label={`Cart with ${cart.items.length} items`}>
                <ShoppingCart className="h-6 w-6" />
                {cart.items.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                        {cart.items.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                )}
             </Link>

             <div ref={profileMenuRef} className="relative profile-menu" onMouseEnter={handleProfileMenuEnter} onMouseLeave={handleProfileMenuLeave}>
                <button onClick={toggleProfileMenu} className="flex items-center p-2 sm:p-3 text-[#01364a] hover:text-emerald-600 hover:bg-gray-100 rounded-md transition-colors" aria-label="User account menu">
                    <User className="h-6 w-6" />
                </button>
                {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-2 shadow-lg border border-gray-100 z-30">
                        {isAuthenticated ? (
                            <>
                                <div className="border-b border-gray-100 px-4 py-2">
                                    <p className="text-sm font-medium text-[#01364a] truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    {isAdmin && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#01364a] text-white mt-1">Admin</span>}
                                </div>
                                {isAdmin && <Link to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Settings className="mr-2 h-4 w-4" />Admin Dashboard</Link>}
                                <Link to="/account" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><User className="mr-2 h-4 w-4" />My Account</Link>
                                <Link to="/orders" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Package className="mr-2 h-4 w-4" />My Orders</Link>
                                <Link to="/wishlist" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Heart className="mr-2 h-4 w-4" />My Wishlist</Link>
                                <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"><LogOut className="mr-2 h-4 w-4" />Sign out</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign in</Link>
                                <Link to="/register" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Create account</Link>
                            </>
                        )}
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* --- Bottom Nav Bar (Desktop, not scrolled) --- */}
        <div className={`hidden lg:block transition-all duration-300 ease-in-out ${isScrolled ? 'h-0 opacity-0 invisible' : 'opacity-100 visible translate-y-0 py-4'}`}>
          <DesktopNavLinks />
        </div>
      </div>

      {/* --- Scrolled Navigation Dropdown (Desktop) --- */}
      {!isMobileMenuBreakpoint && isScrolledNavOpen && (
        <div ref={scrolledNavRef} className="absolute top-full left-0 w-full bg-white shadow-lg ">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <DesktopNavLinks />
          </div>
        </div>
      )}

      {/* --- Mobile Menu --- */}
      {isMobileMenuBreakpoint && isMenuOpen && (
       <div className="mt-4 pb-4 max-h-[calc(100vh-80px)] overflow-y-auto">
             <form onSubmit={handleSearch} className="mb-4 flex items-center">
               <div className="relative w-full">
                 <input
                   type="text"
                   placeholder="Search products..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full rounded-md border border-gray-300 pl-3 pr-10 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                 />
                 <button
                   type="submit"
                   className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-gray-500"
                 >
                   <Search className="h-4 w-4" />
                 </button>
               </div>
             </form>
             <ul className="divide-y divide-gray-100 rounded-lg bg-white border border-gray-200 max-h-fit overflow-y-auto">
               <li>
                 <Link
                   to="/"
                   className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                 >
                   Home
                 </Link>
               </li>
               <li>
                 <Link
                   to="/products"
                   className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                 >
                   All Products
                 </Link>
               </li>

               {/* Cooking Appliances Mobile Submenu */}
               <li className="relative">
                 <button
                   onClick={() =>
                     setActiveDropdown(
                       activeDropdown === "smartphones-mobile"
                         ? null
                         : "smartphones-mobile"
                     )
                   }
                   className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                 >
                   Smartphones{" "}
                   <ChevronDown
                     className={`h-4 w-4 transition-transform ${
                       activeDropdown === "smartphones-mobile" ? "rotate-180" : ""
                     }`}
                   />
                 </button>
                 {activeDropdown === "smartphones-mobile" && (
                   <div className="bg-gray-50 px-4 py-2">
                     <h4 className="font-semibold text-xs mb-2 text-gray-700">
                       Brands
                     </h4>
                     <ul className="space-y-1 mb-3">
                       {activeSmartphonesMenu.types.map((item) => (
                         <li key={item.name}>
                           <Link
                             to={item.path}
                             className="block text-sm text-gray-600 hover:text-emerald-600 pl-2 py-1"
                           >
                             {item.name}
                           </Link>
                         </li>
                       ))}
                     </ul>
                     <h4 className="font-semibold text-xs mb-2 text-gray-700">
                       Condition
                     </h4>
                     <ul className="space-y-1">
                       {activeSmartphonesMenu.conditions.map((item) => (
                         <li key={item.name}>
                           <Link
                             to={item.path}
                             className="block text-sm text-gray-600 hover:text-emerald-600 pl-2 py-1"
                           >
                             {item.name}
                           </Link>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </li>

               {/* Laptops Mobile Submenu */}
               <li className="relative">
                 <button
                   onClick={() =>
                     setActiveDropdown(
                       activeDropdown === "laptops-mobile" ? null : "laptops-mobile"
                     )
                   }
                   className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                 >
                   Laptops{" "}
                   <ChevronDown
                     className={`h-4 w-4 transition-transform ${
                       activeDropdown === "laptops-mobile" ? "rotate-180" : ""
                     }`}
                   />
                 </button>
                 {activeDropdown === "laptops-mobile" && (
                   <div className="bg-gray-50 px-4 py-2">
                     <h4 className="font-semibold text-xs mb-2 text-gray-700">
                       Brands
                     </h4>
                     <ul className="space-y-1 mb-3">
                       {activeLaptopsMenu.types.map((item) => (
                         <li key={item.name}>
                           <Link
                             to={item.path}
                             className="block text-sm text-gray-600 hover:text-emerald-600 pl-2 py-1"
                           >
                             {item.name}
                           </Link>
                         </li>
                       ))}
                     </ul>
                     <h4 className="font-semibold text-xs mb-2 text-gray-700">
                       Condition
                     </h4>
                     <ul className="space-y-1">
                       <li>
                         <Link
                           to="/products/laptops?condition=Like+New"
                           className="block text-sm text-gray-600 hover:text-emerald-600 pl-2 py-1"
                         >
                           Like New
                         </Link>
                       </li>
                       <li>
                         <Link
                           to="/products/laptops?condition=Excellent"
                           className="block text-sm text-gray-600 hover:text-emerald-600 pl-2 py-1"
                         >
                           Excellent
                         </Link>
                       </li>
                       <li>
                         <Link
                           to="/products/laptops?condition=Good"
                           className="block text-sm text-gray-600 hover:text-emerald-600 pl-2 py-1"
                         >
                           Good
                         </Link>
                       </li>
                     </ul>
                   </div>
                 )}
               </li>

               <li>
                 <Link
                   to="/products?filter=featured"
                   className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                 >
                   Featured Products
                 </Link>
               </li>
               <li>
                 <Link
                   to="/products?filter=new"
                   className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                 >
                   New Arrivals
                 </Link>
               </li>
               <li>
                 <Link
                   to="/about"
                   className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                 >
                   About
                 </Link>
               </li>
               <li>
                 <Link
                   to="/contact"
                   className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                 >
                   Contact
                 </Link>
               </li>
               <li className="px-4 py-3 border-t border-gray-200">
                 <Button
                   fullWidth
                   onClick={() => {
                     setIsSellerModalOpen(true);
                     setIsMenuOpen(false);
                   }}
                   variant="primary"
                   className="bg-green-600 hover:bg-green-700"
                 >
                   Join as Seller
                 </Button>
               </li>
               {!isAuthenticated ? (
                 <li className="px-4 py-3">
                   <div className="flex flex-col space-y-2">
                     <Button
                       fullWidth
                       onClick={() => navigate("/login")}
                       variant="primary"
                     >
                       Sign In
                     </Button>
                     <Button
                       fullWidth
                       onClick={() => navigate("/register")}
                       variant="outline"
                     >
                       Create Account
                     </Button>
                   </div>
                 </li>
               ) : (
                 <li className="px-4 py-3">
                   <div className="flex flex-col space-y-2">
                     {isAdmin && (
                       <Button
                         fullWidth
                         onClick={() => navigate("/admin")}
                         variant="primary"
                       >
                         Admin Dashboard
                       </Button>
                     )}
                     <Button
                       fullWidth
                       onClick={() => navigate("/account")}
                       variant="outline"
                     >
                       My Account
                     </Button>
                     <Button
                       fullWidth
                       onClick={handleLogout}
                       variant="outline"
                       leftIcon={<LogOut className="h-4 w-4" />}
                     >
                       Sign Out
                     </Button>
                   </div>
                 </li>
               )}
             </ul>
           </div>
      )}

      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
      />
    </header>
  );
};

export default Header;