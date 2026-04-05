function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h4>About GamiDoc</h4>
          <p>
            GamiDoc is a research-driven tool supporting the design,
            evaluation, and documentation of gamified systems through
            structured methodologies.
          </p>
          <p>
            Project of the Human-computer interaction group at
            Fondazione Bruno Kessler
          </p>
        </div>

        <div className="footer-column">
          <h4>Resources</h4>
          <a href="#">Documentation</a>
          <a href="#">Gamification Frameworks</a>
          <a href="#">UX Evaluation Methods</a>
          <a href="#">Reviewed Designs</a>
        </div>

        <div className="footer-column">
          <h4>Research & Publications</h4>
          <a href="#">Related Publication</a>
          <a href="#">How to cite GamiDoc</a>
        </div>

        <div className="footer-column">
          <h4>Privacy policy</h4>
          <a href="#">Terms of use</a>
          <a href="#">Contact us</a>
        </div>
      </div>

      <div className="footer-bottom">
        © GamiDoc — Research tool for gamification design & evaluation |
        [University/Lab Name] | 2024
      </div>
    </footer>
  );
}

export default Footer;