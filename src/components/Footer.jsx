import ConstructionLink from './ConstructionLink';

/* Site footer (every page, design steps included).
   Only links with a destination belong here: the legal ones stay as placeholders
   ("under construction" popup) because a site with accounts needs them; add the
   Resources / Research links back when their pages exist. */
function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-column footer-column--about">
                    <h4>About GamiDoc</h4>
                    <p>
                        A research-driven tool supporting the design,
                        evaluation and documentation of gamified systems
                        through structured methodologies.
                    </p>
                    <p className="footer-org">
                        HCI group, Fondazione Bruno Kessler
                    </p>
                </div>

                <nav className="footer-column" aria-label="Legal">
                    <h4>Legal</h4>
                    <ConstructionLink>Privacy policy</ConstructionLink>
                    <ConstructionLink>Terms of use</ConstructionLink>
                    <ConstructionLink>Contact</ConstructionLink>
                </nav>
            </div>

            <div className="footer-bottom">
                © {year} GamiDoc · Fondazione Bruno Kessler
            </div>
        </footer>
    );
}

export default Footer;
