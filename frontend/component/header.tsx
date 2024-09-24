'use client';

import { Flex, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const header = () => {
  return (
    <Flex
        justifyContent="space-between"
        alignItems="center"
        p="2rem"
    >
        <Text>Logo</Text>
        <ConnectButton />
    </Flex>
  )
}

export default header 
