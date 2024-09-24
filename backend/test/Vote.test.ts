import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { assert, expect } from "chai";
import { ethers } from "hardhat";

// Type
import { contracts, Vote } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { whitelist } from "../utils/whitelist";


describe('Vote tests', function(){
    let vote : Vote;
    let owner : SignerWithAddress;
    let addr1 : SignerWithAddress;
    let addr2 : SignerWithAddress;
    let addr3 : SignerWithAddress;
    let merkleTree : StandardMerkleTree<string[]>;

    async function deployContractFixture() {
        const [ owner, addr1, addr2, addr3 ] = await ethers.getSigners();
        merkleTree = StandardMerkleTree.of(whitelist, ["address"], {sortLeaves : true});
        const contractFactory = await ethers.getContractFactory("Vote");
        const voteContract = await contractFactory.deploy(owner.address, merkleTree.root);        
        
        return { voteContract, merkleTree, owner, addr1, addr2, addr3 };
    }

    describe('Deploy', function() {
        it('should deploy the smart contract', async function() {
            const { voteContract, merkleTree, owner } = await loadFixture(deployContractFixture);
            const testRoot  =  await voteContract.merkleRoot();

            assert(testRoot === merkleTree.root);
            assert(owner.address === await voteContract.owner())
        });
    });
    describe('Vote', function (){
        it('should return the user vote', async function() {
            const { voteContract, addr1 } = await loadFixture(deployContractFixture);
            const proof  = merkleTree.getProof([addr1.address]);
            const user_vote = BigInt(1);

            await voteContract.connect(addr1).vote(proof, user_vote);
            expect(await voteContract.connect(addr1).getVote()).equal(user_vote);
        });
        it('should revert when call get user without vote', async function(){
            const { voteContract, addr1 } = await loadFixture(deployContractFixture);

            await expect(voteContract.connect(addr1).getVote()).to.be.revertedWith('the user has not voted yet');
        });
        it("check if user has vote", async function() {
            const { voteContract, merkleTree,  addr1 } = await loadFixture(deployContractFixture);
            const proof  = merkleTree.getProof([addr1.address]);
            const user_vote = BigInt(2);

            await voteContract.connect(addr1).vote(proof, user_vote);
           assert(await voteContract.connect(addr1).hasVote() === true);
        });
        it("should allow user whitelisted to vote ABS", async function() {
            const { voteContract, merkleTree,  addr1 } = await loadFixture(deployContractFixture);
            const proof  = merkleTree.getProof([addr1.address]);
            const user_vote = BigInt(2);

            await voteContract.connect(addr1).vote(proof, user_vote);
            const ballot = await voteContract.connect(addr1).getBallot()
            assert(addr1.address != await voteContract.owner());
            assert(await voteContract.connect(addr1).getVote() === user_vote)
            expect(ballot[2]).equal(1);
        });
        it("should allow user whitelisted to vote YES", async function() {
            const { voteContract, merkleTree,  addr1 } = await loadFixture(deployContractFixture);
            const proof  = merkleTree.getProof([addr1.address]);
            const user_vote = BigInt(0);

            await voteContract.connect(addr1).vote(proof, user_vote);
            const ballot = await voteContract.connect(addr1).getBallot()
            assert(addr1.address != await voteContract.owner());
            assert(await voteContract.connect(addr1).getVote() === user_vote)
            expect(ballot[0]).equal(1);
        });
        it("should allow user whitelisted to vote YES", async function() {
            const { voteContract, merkleTree,  addr1 } = await loadFixture(deployContractFixture);
            const proof  = merkleTree.getProof([addr1.address]);
            const user_vote = BigInt(1);

            await voteContract.connect(addr1).vote(proof, user_vote);
            const ballot = await voteContract.connect(addr1).getBallot()
            assert(addr1.address != await voteContract.owner());
            assert(await voteContract.connect(addr1).getVote() === user_vote)
            expect(ballot[1]).equal(1);
        });
        it('should not allow to vote twice', async function() {
            const { voteContract, merkleTree,  addr1 } = await loadFixture(deployContractFixture);
            const proof  = merkleTree.getProof([addr1.address]);
            const user_vote = BigInt(1);

            await voteContract.connect(addr1).vote(proof, user_vote);

            assert(await voteContract.connect(addr1).getVote() === BigInt(user_vote))
            expect(voteContract.connect(addr1).vote(proof, 0)).to.be.revertedWith("has already voted");
        });
        it('should not allow a not whitelisted user lib error', async function() {
            const {  merkleTree, owner } = await loadFixture(deployContractFixture);
            try {
                merkleTree.getProof([owner.address]);
            } 
            catch (error) {}
        });
        it('should not allow a not whitelisted user', async function(){
            const { voteContract, addr1, addr2 } = await loadFixture(deployContractFixture);
            
            const newMerkleTree = StandardMerkleTree.of([[addr1.address]], ["address"], {sortLeaves : true});
            const proof  = merkleTree.getProof([addr1.address]);

            await voteContract.changeMerkleRoot(newMerkleTree.root);
            await expect(voteContract.connect(addr2).vote(proof, 0)).to.be.revertedWith("not whitelisted");

        });
        it('should return the ballot results', async function(){
            const { voteContract } = await loadFixture(deployContractFixture);

            const results = await voteContract.getBallot();
            const yes : bigint = BigInt(results[0]);
            const no : bigint = BigInt(results[1]);
            const abs : bigint = BigInt(results[2]);
            expect(results[0]).equal(0);
            expect(results[1]).equal(0);
            expect(results[2]).equal(0);
        });
    });
    describe("Merkle root", function(){
        it("should allow the change of merkle root for owner", async function() {
            const { voteContract } = await loadFixture(deployContractFixture);
            const newMerkleRoot = "0x67666466666766666767676766647a65657a7171717171736465656565656566";

            await voteContract.changeMerkleRoot(newMerkleRoot);
            assert(await voteContract.merkleRoot() === newMerkleRoot);
        });
        it("should not allow the change of merkle root for owner", async function() { 
            const { voteContract, addr1 } = await loadFixture(deployContractFixture);
            const newMerkleRoot = "0x67666466666766666767676766647a65657a7171717171736465656565656566";

            await expect(voteContract.connect(addr1).changeMerkleRoot(newMerkleRoot)).to.be.revertedWithCustomError(
                voteContract,
                "OwnableUnauthorizedAccount"
            ).withArgs(
                addr1.address
            );
        });
    });
})