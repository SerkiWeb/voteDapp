import { Flex } from "@chakra-ui/react";
import Footer from "./footer"
import Header from "./header"


export const Layout= ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Flex
      direction="column"
      h="100vh"
      justifyContent="center"
    >
      <Header />
      <Flex
        grow="1"
        p="2rem"
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="100%"
      >
          {children}
      </Flex>
      <Footer />
    </Flex>
  )
}

