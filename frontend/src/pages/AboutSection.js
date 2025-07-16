import React from 'react';
import './AboutSection.css';
import { FaEye, FaBullseye } from 'react-icons/fa';

const AboutSection = () => {
    return (
        <div>
            {/* Hero Section - About */}
            <div 
                className="about-section" 
                style={{ backgroundImage: "url('/aboutus.jpg')" }}
            >
                <div className="overlay"></div>
                <div className="content">
                    <h1>About Expense Tracker</h1>
                    <p>
                        We are providing the easiest way to manage expenses. The Expense Tracker is a web-based application that simplifies expense management for individuals and families, enabling users to track expenses, set budgets, and analyze spending patterns.
                    </p>

                    <h2>What We Do</h2>
                    <div className="services">
                        <div className="service">
                            <h3>User and Group Management</h3>
                            <p>
                                Allows secure login, setup, member invitations, and role assignments, ensuring efficient collaboration for shared tasks.
                            </p>
                        </div>
                        <div className="service">
                            <h3>Expense Tracker</h3>
                            <p>
                                Simplifies managing individual and group expenses by allowing users to add, categorize, assign, edit, delete, and filter expenses efficiently.
                            </p>
                        </div>
                        <div className="service">
                            <h3>Budget and Analytics</h3>
                            <p>
                                A budget-focused expense tracker simplifies financial management by analyzing spending patterns.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision and Mission Section */}
            <div className="vision-mission-container">
                <div className="vision-mission">
                    <div className="vision-card fade-in" style={{ width: '90%' }}>
                        <div className="text-content">
                            <FaEye className="icon" />
                            <h2>Our Vision</h2>
                            <p>
                                Our vision is to revolutionize the way individuals and families manage their finances by providing an intuitive, feature-rich, and highly secure expense tracking platform. 
                                We aim to empower users with real-time financial insights, allowing them to make well-informed financial decisions. By integrating advanced analytics and automation, our goal is to create a seamless financial ecosystem that eliminates unnecessary stress in money management. 
                                Ultimately, we aspire to foster financial independence and literacy, helping users build sustainable financial habits for a secure future.
                            </p>
                        </div>
                        <div className="image-content">
                            <img 
                                src="/vision.jpg" 
                                alt="Vision" 
                                className="vision-image" 
                                style={{ width: "100%", maxWidth: "500px", borderRadius: "10px" }}
                            />
                        </div>
                    </div>
                </div>
                <div className="vision-mission">
                    <div className="mission-card fade-in" style={{ width: '90%' }}>
                        <div className="image-content">
                            <img 
                                src="/mission.jpg" 
                                alt="Mission" 
                                className="mission-image" 
                                style={{ width: "100%", maxWidth: "500px", borderRadius: "10px" }}
                            />
                        </div>
                        <div className="text-content">
                            <FaBullseye className="icon" />
                            <h2>Our Mission</h2>
                            <p>
                                Our mission is to simplify financial management for individuals and groups through an innovative, easy-to-use expense tracking system. 
                                We are committed to delivering a platform that ensures accurate financial tracking, budget setting, and insightful analytics. 
                                By leveraging technology, we seek to minimize financial complexities and provide users with a holistic understanding of their expenses. 
                                We believe in financial transparency, collaboration, and security, offering tools that support better decision-making and long-term financial stability. 
                                Our mission is to make financial planning effortless and effective for everyone.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutSection;
