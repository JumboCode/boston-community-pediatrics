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

const BASE_URL = "https://boston-community-pediatrics.vercel.app";
const LOGO_URL = `${BASE_URL}/email/logo.png`;
const tailwindConfig: TailwindConfig = {
  theme: {
    extend: {},
  },
};

export interface EmailTemplateProps {
  firstName: string;
  // message: string; //bruh idk but since the template is reused type shi
}

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
            <Section className="bg-[#234254] py-6 text-center">
              <Img
                src={LOGO_URL}
                alt="Boston Community Pediatrics"
                width="140"
                className="mx-auto"
              />
            </Section>
            <Section className="p-0">
              <Img
                src={LOGO_URL} // don't know where image from figma is but I got it
                alt="The kids"
                width="640"
                className="w-full"
              />
            </Section>
            <Section className="px-8 py-6">{children}</Section>

            <Section className="bg-[#234254] px-6 py-4">
              <Row>
                <Column width="75%" className="p-2">
                  <Text className="text-[10px] text-white leading-5">
                    {" "}
                    123 Address Ave, 01234, Boston, MA || Contact Us: (123)
                    456-7890
                  </Text>

                  <Text className="text-[10px] text-white mt-2">
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
