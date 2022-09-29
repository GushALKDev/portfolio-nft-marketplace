import { useState, useEffect } from "react";
import { Row, Button, Form } from "react-bootstrap";
import { create } from "ipfs-http-client";
import Swal from "sweetalert2";
import { Spinner } from "react-bootstrap";

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

let client;
try {
  client = create({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization,
    },
  });
} catch (error) {
  console.error("IPFS error ", error);
  client = undefined;
}

const Create = ({ nft }) => {
  useEffect(() => {
    document.title = "Create NFT - NFT Marketplace";
    setLoading(false);
  }, []);

  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const uploadtoIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const result = await client.add(file);
        // console.log(result);
        setImage(
          `https://nftmarketplaceportfolio.infura-ipfs.io/ipfs/${result.path}`
        );
      } catch (error) {
        console.log("ipfs image upload error: ", error);
      }
    }
  };
  const createNFT = async () => {
    if (!image || !name || !description) return;
    try {
      setLoading(true);
      const result = await client.add(
        JSON.stringify({ image, name, description })
      );
      mintNFT(result, name);
    } catch (error) {
      console.log("ipfs uir upload error", error);
      setLoading(false);
    }
  };

  const mintNFT = async (result, name) => {
    try {
      const uri = `https://nftmarketplaceportfolio.infura-ipfs.io/ipfs/${result.path}`;
      await (await nft.mint(uri)).wait();
      Swal.fire({
        icon: "success",
        title: "Success!!",
        imageUrl: uri,
        text: "The NFT " + name + " was created.",
      }).then(() => {
        window.location.href = "/my-collection";
      });
    } catch (error) {
      console.log("Error: ", error);
      setLoading(false);
    }
  };

  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          }}
        >
          <Spinner animation="border" style={{ display: "flex", margin: 12 }} />
          Processing blockchain data, please wait...
        </div>
      </main>
    );

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <h1 className="mb-5">Create a new NFT</h1>
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadtoIPFS}
              />
              <Form.Control
                type="text"
                required
                size="lg"
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
              <Form.Control
                required
                as="textarea"
                size="lg"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />
              <div className="g-grid px-0 mt-5">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create!!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
