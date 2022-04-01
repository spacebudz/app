// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title SpaceBudz Auction on Milkomeda
 */
contract Auction {
    address payable private _owner;
    uint256 public startTime;
    uint256 public deadline;
    bool public hasStarted;

    constructor() {
        _owner = payable(msg.sender);
    }

    struct Bid {
        string receivingAddress; // Cardano shelley address in bech32, where NFT will be minted at
        uint256 bidAmount;
        address payable owner;
    }

    mapping(uint256 => Bid) bids;

    Bid bid =
        Bid({receivingAddress: "", bidAmount: 0, owner: payable(address(0))});

    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    event NewBid(address indexed _from, uint256 _value);

    function start(uint256 numberOfDays) external onlyOwner {
        require(!hasStarted, "Auction has already started");
        startTime = block.timestamp;
        deadline = block.timestamp + (numberOfDays * 1 days);
        hasStarted = true;
    }

    function makeBid(string memory receivingAddress) external payable {
        require(hasStarted, "Auction not started yet");
        require(block.timestamp < deadline, "Auction has ended");
        uint256 bidAmount = msg.value;
        require(
            bidAmount > bid.bidAmount,
            "Amount must be greater than current bid"
        );
        if (bid.owner != address(0)) {
            bid.owner.transfer(bid.bidAmount);
        }

        bid = Bid({
            receivingAddress: receivingAddress,
            bidAmount: bidAmount,
            owner: payable(msg.sender)
        });
        emit NewBid(bid.owner, bid.bidAmount);
    }

    function withdraw() external onlyOwner {
        require(hasStarted, "Auction not started yet");
        require(block.timestamp > deadline, "Auction hasn't ended yet");
        payable(msg.sender).transfer(address(this).balance);
    }

    function getAuction()
        external
        view
        returns (
            string memory receivingAddress,
            uint256 bidAmount,
            address payable owner
        )
    {
        return (bid.receivingAddress, bid.bidAmount, bid.owner);
    }
}
