import {useEffect} from "react";

const Home = () => {

    useEffect(() => {
        document.title = 'Home - NFT Marketplace';
    }, []);

    return (
        <div className="home-content">
            <br /><h2>Welcome to the Marketplace</h2><br />
            <h4>IMPORTANT!!! THE SMART CONTRACTS ARE<br />DEPLOYED ON ROPSTEN NETWORK<br /><br /></h4>
            <p>Feel free to create, buy and sell your NFTs.</p>
            <p>NOTE: You can get Ropsten ETH for free <a href='https://faucet.egorfine.com/' target='_blank'>HERE</a>.</p>
        </div>
    );
}

export default Home;
