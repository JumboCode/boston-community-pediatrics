import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Section,
  Tailwind,
  Row,
  Column,
  Text,
} from "@react-email/components";
import { TailwindConfig } from "@react-email/tailwind";
// import useSWR from "swr"; // Gonna assume the template only needs a name
//import bcp_logo from "@/assets/icons/BCP.svg"; I GOT THIS ONE
// import email_header_image from "@/public/email-header-image.jpg";

const BASE_URL = "https://boston-community-pediatrics.vercel.app";
const LOGO_URL = `${BASE_URL}/next.svg`; // Replace with actual logo URL
const HEADER_IMAGE_URL = `${BASE_URL}/email-header-image.jpg?v=1`; // only works when branch catches up to main
const tailwindConfig: TailwindConfig = {
  theme: {
    extend: {},
  },
};

interface BaseLayoutProps {
  children: React.ReactNode;
}

export const BaseLayoutTemplate = ({ children }: BaseLayoutProps) => {
  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        <Head />
        <Body className="bg-[#f2f4f6] font-sans">
          <Container className="w-[640px] max-w-full mx-auto bg-white my-8 border border-gray-200">
            <Section className="bg-[#234254] px-6 py-4">
              <Img
                src={LOGO_URL}
                alt="Boston Community Pediatrics"
                width="140"
                className="mx-auto"
              />
            </Section>
            <Section className="p-0 m-0">
              <Img
                src={HEADER_IMAGE_URL} 
                alt="The kids"
                width="640"
                className="w-full"
                style={{ display: 'block', width: '100%' }}
              />
            </Section>
            
            <Section className="bg-white">{children}</Section>

            <Section className="bg-[#234254] px-6 py-5 text-center">
              <Row>
                <Column width="75%" style={{ verticalAlign: 'middle'}}>
                  <Text className="text-[10px] text-white leading-4 m-0 mb-2 text-center">
                    {" "}
                    123 Address Ave, 01234, Boston, MA || Contact Us: (123)
                    456-7890
                  </Text>

                  <Text className="text-[10px] text-white m-0 text-center">
                    © 2025 Boston Community Pediatrics
                  </Text>
                </Column>

                <Column width="25%" align="right">
                  <Img
                    src={LOGO_URL}
                    alt="Boston Community Pediatrics"
                    width="60"
                    className="ml-auto"
                  />
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// export default BaseLayoutTemplate;
