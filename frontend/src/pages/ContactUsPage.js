import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ContactUsPage.css";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";

const ContactUsPage = () => {
  return (
    <div className="contact-us-container">
      <div className="contact-us-content">
        {/* Left Section: Contact Details */}
        <div className="contact-us-text">
          <p className="text-success">How can we help you?</p>
          <h2 className="fw-bold">Contact Us</h2>
          <p>
            We're here to help and answer any questions you might have. We look forward to hearing from you!
          </p>
          <ul className="list-unstyled">
            <li className="d-flex align-items-center mb-2">
              <FaMapMarkerAlt className="me-2 text-secondary" /> Ankersgade 12C, 1, 8000 Aarhus
            </li>
            <li className="d-flex align-items-center mb-2">
              <FaPhone className="me-2 text-secondary" /> +45 71 99 77 07
            </li>
            <li className="d-flex align-items-center">
              <FaEnvelope className="me-2 text-secondary" />
              <a href="mailto:mail@sleeknote.com" className="text-primary">mail@sleeknote.com</a>
            </li>
          </ul>
        </div>

        {/* Right Section: Image */}
        <div className="contact-us-image">
          <img src="/contactus.jpg" alt="Contact Us Illustration" className="img-fluid" />
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
