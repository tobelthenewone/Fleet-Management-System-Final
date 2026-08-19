import React from 'react';
import '../App.css';
import './Contact.css';

const Contact = () => (
  <section className="contact-section">
    <div className="contact-container">
      <h2>Contact Us</h2>
      <div className="contact-info">
        <p><strong>Address:</strong> Mexico Ras Abebe Aregay Street, Addis Ababa, Ethiopia</p>
        <p><strong>Phone:</strong> +251 11 5 54 00 00</p>
        <p><strong>Email:</strong> info@zemenbank.com</p>
      </div>
      <form className="contact-form">
        <h3>Send us a message</h3>
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" rows="5" required></textarea>
        <button type="submit">Send Message</button>
      </form>
    </div>
  </section>
);

export default Contact; 