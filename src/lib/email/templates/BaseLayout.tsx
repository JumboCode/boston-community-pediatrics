import * as React from "react";
import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { TailwindConfig } from "@react-email/tailwind";

const LOGO_URL =
  "https://pub-d899e9b4014047699cafc4710a50477f.r2.dev/emails/BCP.png";
const HEADER_IMAGE_URL =
  "https://pub-d899e9b4014047699cafc4710a50477f.r2.dev/emails/email-header-image.jpg";
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
          <Container
            style={{
              width: "100%",
              maxWidth: "640px",
              margin: "32px auto",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <Section style={{ backgroundColor: "#234254", padding: "14px 24px", textAlign: "center" }}>
              <Img
                src={LOGO_URL}
                alt="Boston Community Pediatrics"
                width="160"
                style={{
                  display: "block",
                  margin: "0 auto",
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </Section>
            <Section className="p-0 m-0">
              <Img
                src={HEADER_IMAGE_URL}
                alt="The kids"
                width="640"
                height="240"
                style={{
                  display: "block",
                  width: "100%",
                  height: "240px",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            </Section>

            {/* Templates */}
            <Section className="bg-white">{children}</Section>

            {/* Footer */}
            <Section style={{ backgroundColor: "#234254", padding: "12px 24px" }}>
              <Row>
                <Column style={{ verticalAlign: "middle", textAlign: "center", paddingRight: "12px" }}>
                  <Text
                    style={{
                      fontSize: "10px",
                      color: "white",
                      margin: 0,
                      lineHeight: "1.6",
                    }}
                  >
                    527 Albany St., Suite 200 Boston MA 02118 || Contact Us: (617) 934-6009
                  </Text>
                </Column>
                <Column style={{ verticalAlign: "middle", textAlign: "right", width: "130px" }}>
                  <Img
                    src={LOGO_URL}
                    alt="Boston Community Pediatrics"
                    width="110"
                    style={{ display: "block", marginLeft: "auto" }}
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
