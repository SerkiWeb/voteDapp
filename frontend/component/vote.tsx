import React from 'react';
import  { useState, useEffect } from "react";
import { Flex, Text, Button, Spinner, useToast, Alert, AlertIcon, Radio, RadioGroup, Stack } from '@chakra-ui/react';
import { useAccount, useReadContract, type BaseError, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, whitelist, ABI } from '@/constants';
import { Address, formatEther } from 'viem';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { writeContracts } from 'wagmi/actions/experimental';

const Vote = () => {

  const { address } = useAccount();
  const toast = useToast();
  const [merkleProof, setMerkleProof] = useState<string[]>([]);
  const [merkleError, setMerkleError] = useState<string>('');
  const [value, setValue] = useState('0');

  const { data: hasVoted  } = useReadContract({
    address : contractAddress, 
    abi: ABI, 
    functionName: 'hasVote',
    account : address as Address
  }); 

  const {data: ballotData, isLoading: ballotLoading, refetch: refetchBallot } = useReadContract({
    address : contractAddress, 
    abi: ABI, 
    functionName: 'getBallot',
    account : address as Address
  });

  const { data: myVote , isLoading: formatMyVote, refetch: refetchVote  } = useReadContract({
    address : contractAddress, 
    abi: ABI, 
    functionName: 'getVote',
    account : address as Address
  })

  const { data: voting, error: votingError, isPending, writeContract } = useWriteContract();
  
  const votingUser = async() => {
    writeContract({
      address: contractAddress,
      abi:ABI,
      functionName: 'vote',
      account: address,
      args:([merkleProof, BigInt(value)])
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({hash: voting})

  const formatBallot = ( ballotdata : bigint[]) => {
    if (ballotdata != undefined){
      return (`Yes : ${ballotdata[0]} , No : ${ballotdata[1]},  Abstention: ${ballotdata[2]}`);
    }
  }

  const formatvote = (userVote : bigint) => {
    const userVoteInt = BigInt(userVote);
    if (userVoteInt === BigInt(0)) {
      return "Yes";
    } else if (userVoteInt === BigInt(1)) {
      return "No";
    } else if (userVoteInt === BigInt(2)) {
      return "Abstention";
    } else {
      "undefined";
    }
  }

  useEffect(()=> {
    try {
      const tree = StandardMerkleTree.of(whitelist, ["address"], {sortLeaves : true});
      const proof = tree.getProof([address as Address]);
      setMerkleProof(proof);
    }catch (error) {
      setMerkleError('you are not eligible to vote');
    }
  });

  useEffect(() => {
    isConfirmed && refetchBallot() 
  }, [isConfirmed])
 
  useEffect(() => {
    isConfirmed && refetchVote() 
  }, [isConfirmed])
 

  return(
          <Flex
            direction="column"
            width="100%"
          >
            { ballotLoading ? (
              <Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='gray.200'
                color='blue.500'
                size='xl'
              />
            ) : (
              <Text mt="1rem"> Results : <Text as="b">{formatBallot(ballotData as bigint[])}  </Text></Text>
            )}


            { myVote ? (
              <Flex>
                <Text   mt="1rem"> Your Vote : <Text as="b">{formatvote(myVote as bigint)} </Text></Text>
              </Flex>

            ):(
              <Flex
                direction="column"
                width="50%"
              >
                <Text as="b">please Vote !!</Text>
                <RadioGroup onChange={setValue} value={value}>
                  <Stack direction='row'>
                    <Radio value='0'>Yes</Radio>
                    <Radio value='1'>No</Radio>
                    <Radio value='2'>Abstention</Radio>
                  </Stack>
                </RadioGroup>
                <Button onClick={() => votingUser()} mt="1rem">{isPending ? 'Voting...' : 'Voted'}</Button>
              </Flex>
            )}
            {isConfirming && (
              <Alert status='success' mt="1rem">
                <AlertIcon />
                Waiting for confirmation...
              </Alert>
            )}
            {isConfirmed && (
              <Alert status='success' mt="1rem">
                <AlertIcon />
                Your vote has been done !!
              </Alert>
             )}  
            {merkleError ? (
              <Alert status='error' mt="1rem">
                <AlertIcon />
                {merkleError}
              </Alert>
            ) : (
              <Flex
                direction="column"
                width="100%"
              >
                <Alert status='info' mt="1rem">
                  <AlertIcon />
                  <Text>you are eligible to vote</Text>
                </Alert>
              </Flex>
            )}
            {votingError && (
                  <Alert status='error' mt="1rem">
                    <AlertIcon />
                    Error: {(votingError as BaseError).shortMessage || votingError.message}
                  </Alert>
            )}
          </Flex>
  )
}

export default Vote