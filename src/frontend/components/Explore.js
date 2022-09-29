import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Spinner } from 'react-bootstrap';

const Explore = ({ marketplace, nft, account }) => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    // const [Explore, setExplore] = useState([]);

    const loadExplore = async () => {
        const itemCount = await marketplace.itemCount(); // Por qué aqui no usamos call() ??
        let items = [];
        for (let indx = 1; indx <= itemCount; indx++) {
            const item = await marketplace.items(indx);
            if (!item.sold && !item.canceled) {
                const uri = await nft.tokenURI(item.tokenId);
                const response = await fetch(uri);
                const metadata = await response.json();
                const totalPrice = await marketplace.getTotalPrice(item.itemId);
                // console.log(uri);
                items.push({
                    totalPrice,
                    price: item.tokenPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                })
            }
        }
        setLoading(false);
        setItems(items);
        // setExplore(Explore);
    }

    const buyMarketItem = async (item) => {
        try {
            setLoading(true);
            await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait();
            window.location.href = "/my-collection";
        } catch (error) {
            console.log("Error: ", error);
            setLoading(false);
        }
    }

    const cancelItem = async (item) => {
        try {
            setLoading(true);
            await (await marketplace.cancelItem(item.itemId)).wait();
            loadExplore();
        } catch (error) {
            console.log("Error: ", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        loadExplore();
            document.title = 'Explore NFTs - NFT Marketplace';
    }, []);

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '80vh'
            }}>
            <Spinner animation='border' style={{ display: 'flex', margin: 12 }} />
            Processing blockchain data, please wait...
            </div>
        </main>
    )

    return (
        <div className="flex justify-center">
            {items.length > 0 ?
                <div className="px-5 container">
                    <Row xs={1} md={2} lg={4} className="g4 py-5">
                        {items.map((item, idx) => (
                            <Col key={idx} className="overflow-hidden">
                                <Card>
                                    <Card.Img variant="top" src={item.image} />
                                    <Card.Body color="secondary">
                                        <Card.Title><b>{item.name}</b></Card.Title>
                                        <Card.Text>{item.description}</Card.Text>
                                        <Card.Text>
                                        {(item.seller.toLowerCase() === account) ? <b>Owned by you.</b>
                                            : <b>Owned by: </b>
                                        }
                                        {(item.seller.toLowerCase() !== account) ? item.seller.slice(0, 5) + '...' + item.seller.slice(37, 42)
                                        : ''}
                                        </Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <div className="d-grid">
                                            {(item.seller.toLowerCase() === account) ? (
                                            <Button onClick={() => cancelItem(item)} variant="secondary" size="lg">
                                            Remove from sell<br />({ethers.utils.formatEther(item.price)} ETH)
                                            </Button>
                                            ) : (
                                                <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                                                Buy by {ethers.utils.formatEther(item.totalPrice)} ETH
                                                </Button>
                                            )}
                                        </div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
                : (
                    <main style={{ padding: "1rem 0" }}>
                        <h2 style={{margin:20}}>No assets to sell!!</h2>
                    </main>
                )}
        </div>
    );
}

export default Explore;