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

// const BASE_URL = "https://boston-community-pediatrics-5ntupemwm.vercel.app";
const LOGO_URL = `https://pub-d899e9b4014047699cafc4710a50477f.r2.dev/emails/BCP.png`;
const HEADER_IMAGE_URL = `https://pub-d899e9b4014047699cafc4710a50477f.r2.dev/emails/email-header-image.jpg`;
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
            <Section className="bg-[#234254] px-6 py-1 text-center">
              <Img
                src={LOGO_URL}
                alt="Boston Community Pediatrics"
                width="160"
                style={{
                  display: "block",
                  margin: "0 auto",
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
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{ backgroundColor: "#234254" }}
            >
              <tr style={{ height: "48px" }}>
                <td width="20%"></td>
                <td
                  width="60%"
                  style={{
                    verticalAlign: "middle",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      color: "white",
                      margin: 0,
                      lineHeight: "1.4",
                    }}
                  >
                    527 Albany St., Suite 200 Boston MA 02118 || Contact Us:
                    (617) 934-6009
                  </p>
                </td>

                <td
                  width="15%"
                  style={{
                    verticalAlign: "middle",
                    textAlign: "right",
                    paddingRight: "24px",
                  }}
                >
                  <Img
                    src={LOGO_URL}
                    alt="Boston Community Pediatrics"
                    width="125"
                    height="34"
                    style={{ display: "block" }}
                  />
                </td>
              </tr>
            </table>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
