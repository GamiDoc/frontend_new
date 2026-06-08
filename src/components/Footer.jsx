import ConstructionLink from './ConstructionLink';

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
          <ConstructionLink>Documentation</ConstructionLink>
          <ConstructionLink>Gamification Frameworks</ConstructionLink>
          <ConstructionLink>UX Evaluation Methods</ConstructionLink>
          <ConstructionLink>Reviewed Designs</ConstructionLink>
        </div>

        <div className="footer-column">
          <h4>Research & Publications</h4>
          <ConstructionLink>Related Publication</ConstructionLink>
          <ConstructionLink>How to cite GamiDoc</ConstructionLink>
        </div>

        <div className="footer-column">
          <h4>Privacy policy</h4>
          <ConstructionLink>Terms of use</ConstructionLink>
          <ConstructionLink>Contact us</ConstructionLink>
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