const { expect } = require("chai")
const { ethers } = require("hardhat")

const toWei = num => ethers.utils.parseEther(num.toString())
const fromWei = num => ethers.utils.formatEther(num)

describe("NFTMarketplace", function () {
    let NFT;
    let nft;
    let Marketplace;
    let marketplace;
    let deployer;
    let addr1;
    let addr2;
    let feePercent = 10;
    let URI = "sample URI";

    beforeEach(async function () {
        NFT = await ethers.getContractFactory("NFT");
        Marketplace = await ethers.getContractFactory("Marketplace");
        [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();

        marketplace = await Marketplace.deploy(feePercent)
        nft = await NFT.deploy()
    });

    describe("Deployment", function () {
        it("Track name and symbol of the NFT collection", async function () {
            const NFTName = "DApp NFT";
            const NFTSymbol = "DAPP";
            expect(await nft.name()).to.equal(NFTName);
            expect(await nft.symbol()).to.equal(NFTSymbol);
        });

        it("Track feeAccount and feePercent of the Marketplace", async function () {
            const feePercent = 10;
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            expect(await marketplace.feePercent()).to.equal(feePercent);
        });
    });

    describe("Minting NFTs", function () {
        it("Track each minted NFT", async function () {
            await nft.connect(addr1).mint(URI);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);

            await nft.connect(addr2).mint(URI);
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(addr2.address)).to.equal(1);
            expect(await nft.tokenURI(2)).to.equal(URI);
        });

        // it("", async function () {

        // });
    });

    describe("Making marketplace items", function () {
        const price = 1;

        beforeEach(async function () {
            await nft.connect(addr1).mint(URI);
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
        });

        it("Track newly created item", async function () {
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price)))
            .to.emit(marketplace, "Offered")
            .withArgs(
                1,
                nft.address,
                1,
                toWei(price),
                addr1.address
            );

            expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            expect(await marketplace.itemCount()).to.equal(1)
            const item = await marketplace.items(1);
            expect(item.itemId).to.equal(1);
            expect(item.nft).to.equal(nft.address);
            expect(item.tokenId).to.equal(1);
            expect(item.tokenPrice).to.equal(toWei(price));
            expect(item.sold).to.equal(false);
        });

        it("Should fail if price is zero", async function () {
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, 0)).to.be.revertedWith("The tokenPrice must be greater than 0");
        });
    });

    describe("Buying marketplace items", function () {

        let price = 2;
        let fee = (feePercent/100)*price;

        beforeEach(async function () {
            await nft.connect(addr1).mint(URI);
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price)))
            .to.emit(marketplace, "Offered")
            .withArgs(
                1,
                nft.address,
                1,
                toWei(price),
                addr1.address
            );
        });

        it("Track recently purchased item", async function () {
            const sellerInitialBalance = await addr1.getBalance();
            const feeAccountInitialBalance = await deployer.getBalance();
            const totalPriceInWei = await marketplace.getTotalPrice(1);

            await expect(marketplace.connect(addr2).purchaseItem(1, {value:totalPriceInWei}))
            .to.emit(marketplace, "Bought")
            .withArgs(
                1,
                nft.address,
                1,
                toWei(price),
                addr1.address,
                addr2.address
            );
            
            const sellerFinalBalance = await addr1.getBalance();
            const feeAccountFinalBalance = await deployer.getBalance();

            expect((await marketplace.items(1)).sold).to.equal(true);
            expect(+fromWei(sellerFinalBalance)).to.equal(+price + +fromWei(sellerInitialBalance));
            expect(+fromWei(feeAccountFinalBalance)).to.equal(+fee + +fromWei(feeAccountInitialBalance));
            expect(await nft.ownerOf(1)).to.equal(addr2.address);
        });
    });
})