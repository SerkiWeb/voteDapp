import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { whitelist } from "../../utils/whitelist";
import { ethers } from "hardhat";


export default buildModule("voter",  (m) => {
    let merkleTree : StandardMerkleTree<string[]> = StandardMerkleTree.of(whitelist, ["address"], {sortLeaves: true});

    const moduleVote = m.contract("Vote", ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", merkleTree.root]);
  
    return { moduleVote };
  });