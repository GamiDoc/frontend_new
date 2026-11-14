import ConstructionLink from './ConstructionLink';

/* Site footer (every page, design steps included): About, Resources, Research &
   Publications, Legal. Links without a page yet open the "under construction" popup. */
function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-column footer-column--about">
                    <h4>About GamiDoc</h4>
                    <p>
                        A research-driven tool supporting the design, evaluation
                        and documentation of gamified systems through structured
                        methodologies.
                    </p>
                    <p className="footer-org">
                        HCI group, Fondazione Bruno Kessler
                    </p>
                </div>

                <nav className="footer-column" aria-label="Resources">
                    <h4>Resources</h4>
                    <ConstructionLink>Documentation</ConstructionLink>
                    <ConstructionLink>Gamification frameworks</ConstructionLink>
                    <ConstructionLink>UX evaluation methods</ConstructionLink>
                    <ConstructionLink>Reviewed designs</ConstructionLink>
                </nav>

                <nav
                    className="footer-column"
                    aria-label="Research and publications"
                >
                    <h4>Research & Publications</h4>
                    <ConstructionLink>Related publication</ConstructionLink>
                    <ConstructionLink>How to cite GamiDoc</ConstructionLink>
                </nav>

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
