import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Navigation from './Navbar';
import Home from './Home';
import Create from './Create';
import MyListedItems from './MyListedItems';
import MyCollection from './MyCollection';
import Footer from './Footer';
import Explore from './Explore';
import MarketplaceAbi from '../contractsData/Marketplace.json';
import MarketplaceAddress from '../contractsData/Marketplace-address.json';
import NFTAbi from '../contractsData/NFT.json';
import NFTAddress from '../contractsData/NFT-address.json';
import { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { Spinner } from 'react-bootstrap';
import './App.css';

function App() {

  useEffect(() => {
    web3Handler();
  }, []);

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [marketplace, setMarketplace] = useState({});
  const [nft, setNFT] = useState({});

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    window.ethereum.on('chainChanged', (chainID) => {
      window.location.reload();
    });

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0]);
      await web3Handler();
    })

    loadContracts(signer);
  }

  const loadContracts = async (signer) => {
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer);
    setMarketplace(marketplace);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNFT(nft);
    setLoading(false);
  }

  return (
    <BrowserRouter>
      <div className='App'>
        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '80vh'
            }}>
              <Spinner animation='border' style={{ display: 'flex', margin: 12 }} />
              <p className='mx3 my-0'>Waiting for Metamask's Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home/>
              } />
              <Route path="/explore" element={
                <Explore marketplace={marketplace} nft={nft}  account={account} />
              } />
              <Route path="/create-nft" element={
                <Create marketplace={marketplace} nft={nft} />
              } />
              <Route path="/my-listed-items" element={
                <MyListedItems marketplace={marketplace} nft={nft} account={account} />
              } />
              <Route path="/my-collection" element={
                <MyCollection marketplace={marketplace} nft={nft} account={account} />
              } />
            </Routes>
          )}
        </div>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;