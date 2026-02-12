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

const BASE_URL = "https://boston-community-pediatrics.vercel.app";
const LOGO_URL = `${BASE_URL}/BCP.svg`;
const HEADER_IMAGE_URL = `${BASE_URL}/email-header-image.jpg`;
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

        {/* Header */}
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
                style={{ display: "block", width: "100%" }}
              />
            </Section>

            {/* Templates */}
            <Section className="bg-white">{children}</Section>

            {/* Footer */}
            <Section className="bg-[#234254] px-6 py-4">
              <Row>
                <Column width="75%" className="p-2">
                  <Text className="text-[10px] text-white leading-5">
                    {" "}
                    527 Albany St., Suite 200 Boston MA 02118 || Contact Us:
                    (617) 934-6009
                  </Text>

                  <Text className="text-[10px] text-white mt-2">
                    © 2026 Boston Community Pediatrics
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
