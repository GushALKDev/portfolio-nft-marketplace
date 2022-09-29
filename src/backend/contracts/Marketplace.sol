//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {

    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint tokenPrice;
        address payable seller;
        bool sold;
        bool canceled;
    }

    mapping(uint => Item) public items;
    mapping(uint => uint) public tokenItem;

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function sellItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "The tokenPrice must be greater than 0");
        itemCount++;
        //_nft.transferFrom(msg.sender, address(this), _tokenId);
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false,
            false
        );
        tokenItem[_tokenId] = itemCount;
        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "The NFT does not exist.");
        require(msg.value >= _totalPrice, "The payment must be equal or greater than the NFT price.");
        require(item.sold == false,"The NFT is not available for purchasing.");
        item.seller.transfer(item.tokenPrice);
        feeAccount.transfer(_totalPrice - item.tokenPrice);
        item.sold = true;
        item.nft.transferFrom(item.seller,msg.sender, item.tokenId);
        tokenItem[item.tokenId] = 0;
        emit Bought(_itemId, address(item.nft), item.tokenId, item.tokenPrice, item.seller, msg.sender);
    }

    function cancelItem(uint _itemId) external nonReentrant {
        Item storage item = items[_itemId];
        require(item.seller == msg.sender,"You are not allowed to cancel this sell.");
        item.canceled = true;
        tokenItem[item.tokenId] = 0;
    }

    function getTotalPrice(uint _itemId) public view returns(uint) {
        return items[_itemId].tokenPrice + ((items[_itemId].tokenPrice / 100) * feePercent);
    }

    function getItemId(uint _tokenId) public view returns(uint) {
        return tokenItem[_tokenId];
    }
}
