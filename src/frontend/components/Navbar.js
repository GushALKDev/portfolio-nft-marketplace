import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import nft from "./nft.png";
import portfolio from './circle1.png'

const Navigation = ({ web3Handler, account }) => {

    return (
        <Navbar expand="lg" bg="primary" variant="dark">
            <Container>
                <Navbar.Brand>
                    <a href='https://www.gustavomartinalonso.com'><img src={portfolio} className="portfolio" alt="" /></a>&nbsp;
                    <img src={nft} width="40" heigth="40" className="" alt="" />
                    &nbsp;NFT Marketplace
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar navbar-dark bg-primary" />
                <Navbar.Collapse id="navbar navbar-dark bg-primary">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/explore">Explore</Nav.Link>
                        <Nav.Link as={Link} to="/create-nft">Create</Nav.Link>
                        {/* <Nav.Link as={Link} to="/my-listed-items">Listed</Nav.Link> */}
                        <Nav.Link as={Link} to="/my-collection">My Collection</Nav.Link>
                    </Nav>
                    <Nav>
                        {account ? (
                            <Nav.Link
                                href={`https://ropsten.etherscan.io/address/${account}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="button nav-button btn-sm mx-4">
                                <Button variant="outline-light">
                                    {account.slice(0, 10) + '...' + account.slice(32, 42)}
                                </Button>
                            </Nav.Link>
                        ) : (
                            <Button onClick={web3Handler} variant="outline-light">
                                Connect Wallet
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>

            </Container>
        </Navbar>
    )
}

export default Navigation