import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Carousel from "react-bootstrap/Carousel";
import AboutSection from "./AboutSection";
import ContactUsPage from "./ContactUsPage";
import { FaCaretDown } from "react-icons/fa";

const Home = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showDropdown, setShowDropdown] = useState(false);
  const [fromDashboard, setFromDashboard] = useState(
    sessionStorage.getItem("fromDashboard") === "true"
  );

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const featuresRef = useRef(null);


  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (location.state?.fromDashboard) {
      sessionStorage.setItem("fromDashboard", "true");
      setFromDashboard(true);
    }
  }, [location]);

  // Detect Back Button Navigation and Restore Profile Icon View
  useEffect(() => {
    const handleBackNavigation = () => {
      const token = localStorage.getItem("token");
      const fromDashboardStored = sessionStorage.getItem("fromDashboard") === "true";
      
      if (token && fromDashboardStored) {
        setIsLoggedIn(true);
        setFromDashboard(true);
        setCurrentPage("home"); // Ensure homepage loads with profile icon
      }
    };

    window.addEventListener("popstate", handleBackNavigation);
    return () => {
      window.removeEventListener("popstate", handleBackNavigation);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("fromDashboard");
    setIsLoggedIn(false);
    setFromDashboard(false);
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <div className="home">
      {/* Header (Always Rendered) */}
      <header className="header">
        <div className="logo-container">
          <img src="/logo.jpg" alt="Logo" className="logo" />
          <div className="title">Expense Tracker</div>
        </div>
        <nav className="nav">
          <a href="#home" onClick={() => setCurrentPage("home")}>
            Home
          </a>
          <a href="#about" onClick={() => setCurrentPage("aboutus")}>
            About Us
          </a>
          <a href="#contact" onClick={() => setCurrentPage("contactus")}>
            Contact Us
          </a>

          {isLoggedIn && fromDashboard ? (
            <div className="profile-container" ref={dropdownRef}>
              <div
                className="profile-toggle"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img src="/profile icon.jpg" alt="Profile Icon" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                <FaCaretDown className="down-arrow" />
              </div>
              {showDropdown && (
                <div className="dropdown-menu show">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="dropdown-item"
                  >
                    Dashboard
                  </button>
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                onClick={() => navigate("/login")} // Navigate to the login route
                className="btn btn-primary me-2"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/registration-type")} // Navigate to the register route
                className="btn btn-primary"
              >
                Register
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Render the Current Page Content */}
      {currentPage === "home" && (
        <>
          {/* Hero Section */}
          <section 
            className="hero" 
            style={{ 
              display: "flex", 
              alignItems: "stretch", 
              height: "100vh", 
              width: "100vw", 
              margin: "0", 
              padding: "0" 
            }}
          >
            {/* Left Side: Image (Smaller than before) */}
            <div 
              style={{ 
                flex: "2.4",  /* Reduced width to give more space to the right */
                height: "100vh", 
                overflow: "hidden", 
                margin: "0", 
                padding: "0" 
              }}
            >  
              <img 
                className="hero-image" 
                src="/home.jpg" 
                alt="Expense Tracker Illustration" 
                style={{ 
                  width: "100vw",  
                  height: "100vh", 
                  objectFit: "cover",  
                  objectPosition: "left"  
                }} 
              />
            </div>

            {/* Right Side: Bigger White Container */}
            <div 
              className="hero-content" 
              style={{ 
                flex: "1.1",  /* Increased width */
                backgroundColor: "white",  
                height: "100vh", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center",
                alignItems: "flex-start",
                margin: "0", 
                padding: "80px"  /* Added more padding for spacing */
              }}
            >
              <h3 style={{ fontSize: "4rem", color: "blue" }}>Expense Tracker</h3>  {/* Blue title */}
              <h3 style={{ fontSize: "2.2rem", color: "#333" }}>Track Your Expenses Like Never Before</h3>
              <p style={{ fontSize: "1.4rem", color: "#555" }}>
                <strong>Simple finance tracker</strong><br />
                It takes seconds to record daily transactions. Put them into clear and visualized categories such as 
                <strong> Expense</strong>: Food, Shopping or <strong>Income</strong>: Salary, Gift.
              </p>
             <button 
            className="btn btn-primary" 
            style={{ fontSize: "1.4rem", padding: "15px 30px" }}
             onClick={() => {
              featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
>
  Read More
</button>

            </div>
          </section>

          {/* Savings Tips Section */}
          <section className="savings-tips">
            <h2>Saving Tips</h2>
            <Carousel>
              <Carousel.Item>
                <div className="carousel-item-content">
                  <div className="carousel-text">
                    <p>
                      Look for Discounts: Keep an eye out for discounts and special
                      offers on products you regularly use.
                    </p>
                  </div>
                  <img
                    src="/savingtips1.png"
                    alt="Tip 1"
                    className="carousel-image"
                  />
                </div>
              </Carousel.Item>
              <Carousel.Item>
                <div className="carousel-item-content">
                  <div className="carousel-text">
                    <p>
                      Buy in Bulk: Purchasing in larger quantities can help save
                      money over time.
                    </p>
                  </div>
                  <img
                    src="/savingtips2.jpg"
                    alt="Tip 2"
                    className="carousel-image"
                  />
                </div>
              </Carousel.Item>
              <Carousel.Item>
                <div className="carousel-item-content">
                  <div className="carousel-text">
                    <p>Avoid Waste: Use what you have effectively before buying more.</p>
                  </div>
                  <img
                    src="/savingtips3.jpg"
                    alt="Tip 3"
                    className="carousel-image"
                  />
                </div>
              </Carousel.Item>
            </Carousel>
          </section>

          {/* Features Section */}
          <section className="container-side-by-side" ref={featuresRef} >
            <div className="features">
              <h2>We Offer a Variety of Features</h2>
              <div className="features-row">
                <div className="feature-card">
                  <img src="/feature1.jpg" alt="Feature 1" />
                  <h3>Set Your Budget</h3>
                  <p>Plan your monthly expenses and set achievable goals effortlessly.</p>
                </div>
                <div className="feature-card">
                  <img src="/feature2.jpg" alt="Feature 2" />
                  <h3>Track Expenses</h3>
                  <p>Monitor your spending habits and stay on top of your finances.</p>
                </div>
                <div className="feature-card">
                  <img src="/feature3.jpg" alt="Feature 3" />
                  <h3>Analyze Trends</h3>
                  <p>Visualize your spending patterns through detailed reports and graphs.</p>
                </div>
                <div className="feature-card">
                  <img src="/feature4.jpg" alt="Feature 4" />
                  <h3>Save Money</h3>
                  <p>Receive personalized tips to save on everyday expenses.</p>
                </div>
              </div>

              {/* Additional Features */}
              <div className="features-row">
                <div className="feature-card">
                  <img src="/feature5.jpg" alt="Feature 5" />
                  <h3>Analyze your expenses</h3>
                  <p>Visualize your expenses with interactive charts and insightful reports</p>
                </div>
                <div className="feature-card">
                  <img className="width-change" src="/feature6.jpg" alt="Feature 6" />
                  <h3>Multi-Platform Support</h3>
                  <p>Access your budget tracker from any device, anytime.</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews">
              <h2>Our Users Reviews</h2>
              <div className="reviews-row">
                <div className="review-card">
                  <img src="/user1.png" alt="User 1" />
                  <p><strong>Mani</strong></p>
                  <p>Expense tracker is very good.</p>
                  <div className="stars">⭐⭐⭐⭐⭐</div>
                </div>
                <div className="review-card">
                  <img src="/user2.png" alt="User 2" />
                  <p><strong>Ruhani Sharma</strong></p>
                  <p>I can easily manage my finance using Expense Tracker.</p>
                  <div className="stars">⭐⭐⭐⭐</div>
                </div>
                <div className="review-card">
                  <img src="/user3.png" alt="User 3" />
                  <p><strong>Manoj</strong></p>
                  <p>Very good experience.</p>
                  <div className="stars">⭐⭐⭐⭐⭐</div>
                </div>
                <div className="review-card">
                  <img src="/user4.jpg" alt="User 4" />
                  <p><strong>Andrena</strong></p>
                  <p>It is easy to handle and use.</p>
                  <div className="stars">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* About Us Section */}
      {currentPage === "aboutus" && <AboutSection />}

      {/* Contact Us Section */}
      {currentPage === "contactus" && <ContactUsPage />}

      {/* Footer (Always Rendered) */}
      <footer className="footer">
        <div className="footer-left">
          <div className="footer-logo-container">
            <img src="/logo.jpg" alt="Expense Tracker Logo" className="footer-logo" />
            <div className="follow-us">Follow Us</div>
          </div>
          <div className="footer-social-icons">
            <a href="#" className="social-icon">
              <img src="/google.png" alt="Google" />
            </a>
            <a href="#" className="social-icon">
              <img src="/facebook.png" alt="Facebook" />
            </a>
          </div>
        </div>
        <div className="footer-right">
          <div className="footer-column">
            <h3>Company</h3>
            <a href="#">Home</a>
            <a href="#">Contact Us</a>
            <a href="#">About Us</a>
            <a href="#">Services</a>
          </div>
          <div className="footer-column">
            <h3>Legal</h3>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Advertise</a>
          </div>
          <div className="footer-column">
            <h3>Others</h3>
            <a href="#">FAQ</a>
            <a href="#">Support</a>
            <a href="#">Careers</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;