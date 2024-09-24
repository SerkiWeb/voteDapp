import React from 'react'
import {Alert, AlertIcon } from "@chakra-ui/react"

const NotConnected = () => {
  return (
    <Alert status="warning">
      < AlertIcon/>
      please connect your wallet
    </Alert>
  )
}

export default NotConnected