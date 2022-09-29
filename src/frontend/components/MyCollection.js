import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';

function MyCollection ({ marketplace, nft, account }) {
    const [loading, setLoading] = useState(true);
    const [MyCollection, setMyCollection] = useState([]);
    
    const loadMyCollection = async () => {
        const tokenCount = await nft.tokenCount();
        let MyCollection = [];
        for (let indx = 1; indx <= tokenCount; indx++) {
            const owner = await nft.ownerOf(indx);
            const itemId = await marketplace.getItemId(indx);
            if (owner.toLowerCase() === account) {
                const uri = await nft.tokenURI(indx);
                const response = await fetch(uri);
                const metadata = await response.json();
                let totalPrice;
                (itemId == 0) ? (totalPrice = 0) : (totalPrice = await marketplace.getTotalPrice(itemId));
                const onSale = false; // poner condicional para los que están en venta
                let nftToken = {
                    tokenId: indx,
                    itemId: itemId,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image,
                    price: totalPrice,
                    onsale: onSale
                };
                MyCollection.push(nftToken);
            }
        }
        setLoading(false);
        setMyCollection(MyCollection);
    }

    const cancelItem = async (nftToken) => {
        try { 
            setLoading(true);
            await (await marketplace.cancelItem(nftToken.itemId)).wait();
            loadMyCollection();
        } catch (error) {
            console.log("Error: ", error);
            setLoading(false);
        }
    }

    const sellDialog = (nftToken) => {
        Swal.fire({
            title: 'Sell ' + nftToken.name + ' #' + nftToken.tokenId,
            imageUrl: nftToken.image,
            html: `<input type="number" id="price" class="swal2-input" placeholder="Price">`,
            confirmButtonText: 'Confirm',
            focusConfirm: false,
            preConfirm: () => {
              const price = Swal.getPopup().querySelector('#price').value
              if (!price) {
                Swal.showValidationMessage(`Please enter the selling price`)
              }
              sellItem(nftToken, price);
            }
          });
    }

    const sellItem = async (nftToken, _price) => {
        try {
            setLoading(true);
            const price = ethers.utils.parseEther(_price.toString());
            
            const alreadyApproved = await nft.isApprovedForAll(account, marketplace.address);

            if (!alreadyApproved) {
                Swal.fire(
                    'Selling rights.',
                    'You have to give transfer rights to the marketplace before listing the item.',
                    'warning'
                )
                await (await nft.setApprovalForAll(marketplace.address, true)).wait();
                sellItem(nftToken, _price);
            }

            else { await (await marketplace.sellItem(nft.address, nftToken.tokenId, price)).wait(); }

            loadMyCollection();
        } catch (error) {
            console.log("Error: ", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMyCollection();    
        document.title = 'My Collection - NFT Marketplace';
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
            {MyCollection.length > 0 ?
                <div className="px-5 container">
                    <h1 className="mt-5">My Collection</h1>
                    <Row xs={1} md={2} lg={4} className="bottom-spacer g4 py-5">
                        {MyCollection.map((nftToken, idx) => (
                            <Col key={idx} className="overflow-hidden">
                                <Card>
                                    <Card.Img variant="top" src={nftToken.image} />
                                    <Card.Body>
                                        <Card.Title><b>{nftToken.name} #{nftToken.tokenId}</b></Card.Title>
                                    </Card.Body>
                                    <Card.Footer>
                                        {(nftToken.itemId != 0) ? (
                                            <Button onClick={() => cancelItem(nftToken)} variant="secondary" size="lg">
                                            Remove from sell<br />({ethers.utils.formatEther(nftToken.price)} ETH)
                                            </Button>
                                            )
                                        : (
                                            <Button onClick={() => sellDialog(nftToken)} variant="primary" size="lg">
                                            Sell NFT
                                            </Button>
                                            )
                                        } 
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
                : (
                    <main style={{ padding: "1rem 0" }}>
                        <h2 style={{ margin: 20 }}>Your NFT collection is empty!!</h2>
                    </main>
                )}
        </div>
    );
}

export default MyCollection;