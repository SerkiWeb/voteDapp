pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Vote is Ownable {

    bytes32 public merkleRoot;
    mapping (address => bool) hasVoted;
    mapping (address => statusVote) voting;
    enum statusVote {
        YES,
        NO,
        ABS
    }

    struct Ballot {
        uint voteYes;
        uint voteNo;
        uint voteAbs; 
    }
    Ballot ownerBallot;


    constructor(address _owner, bytes32 _merkleRoot) 
        Ownable(_owner)
    {
        merkleRoot = _merkleRoot;
        ownerBallot.voteYes = 0;
        ownerBallot.voteNo  = 0;
        ownerBallot.voteAbs = 0;

    }

    /**
     * @notice change the merkle root
     * 
     * @param _merkleRoot the nnew merkle root
     */
    function changeMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    /**
     * @notice check if an address is whitelisted or not
     * 
     * @param _account the account checked
     * @param _proof  the merkle proof
     * 
     * @return bool returns true if whitelisted false otherwise
     */
    function isWhiteListed(address _account, bytes32[] calldata _proof) internal view returns(bool) {
        bytes32 leaf = keccak256(abi.encode(keccak256(abi.encode(_account)))); 
        return MerkleProof.verify(_proof, merkleRoot, leaf);
    }


    /**
     * @notice allow a user whitelisted to vote
     * 
     * @param _proof  the merkle proof
     * @param _voting user vote
     */
    function vote(bytes32[] calldata _proof, uint _voting) external {
        require(isWhiteListed(_msgSender(), _proof), "not whitelisted");
        require(!hasVoted[_msgSender()], "has already voted");

        hasVoted[_msgSender()] = true;
        voting[_msgSender()] = statusVote(_voting);
        
        if (_voting == 0) {
            ownerBallot.voteYes++; 
        } else if ( _voting == 1) {
            ownerBallot.voteNo++;
        } else if (_voting == 2) {
            ownerBallot.voteAbs++;
        }
        
    }

    /**
     * @notice the retuen the user vote
     * 
     * @return statusVote retuen the user vote 0, 1 or 2
     */
    function getVote() view external returns(statusVote) {
        require(hasVoted[_msgSender()], 'the user has not voted yet');

        return voting[_msgSender()];
    }

    /**
     * @notice return the user has voted
     * 
     * @return bool return true if the user has voted false otherwise 
     */
    function hasVote() view external returns(bool) {
        return hasVoted[_msgSender()];
    }

    /**
     * @notice returns the current ballot
     * 
     * @return voteYes number of vote yes
     * @return voteNo number of vote no
     * @return voteAbs  number of vote abstention
     */
    function getBallot() view external returns(uint voteYes, uint voteNo, uint voteAbs) {
        return (ownerBallot.voteYes, ownerBallot.voteNo, ownerBallot.voteAbs);
    }
}