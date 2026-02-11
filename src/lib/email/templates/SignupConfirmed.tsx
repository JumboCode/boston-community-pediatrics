import * as React from "react";
import { BaseLayoutTemplate } from "./BaseLayout";
import {
  Section,
  Text,
  Container,
  Link,
  Row,
  Column,
  Img,
} from "@react-email/components";

const BASE_URL = "https://boston-community-pediatrics.vercel.app";
const PLACEHOLDER_EVENT_IMAGE_URL = `${BASE_URL}/event1.jpg`;

interface SignedUpTemplateProps {
  firstName: string;
  eventName: string;
  position: string;
  startTime: string;
  endTime: string;
  date: string;
  filledSlots: number;
  location: string;
}

export function SignupConfirmedTemplate({
  firstName,
  eventName,
  position,
  startTime,
  endTime,
  filledSlots,
  location,
  date,
}: SignedUpTemplateProps) {
  return (
    <BaseLayoutTemplate>
      <Section className="py-6 px-8">

        {/* General Message */}
        <Text className="text-sm mt-0 mb-4">
          Dear <strong>{firstName}</strong>,
        </Text>

        <Text className="text-sm mt-0 mb-6" style={{ marginLeft: "10px" }}>
          Thank you for signing up for the event! We look forward to seeing you
          there. If there are any updates to this position we will send you an
          email.
        </Text>
        
        <Text className="text-base font-bold mt-6 mb-3">
          Your upcoming volunteering event
        </Text>

        {/* Event Card */}
        <Container className="border border-gray-300 bg-white p-0 m-0">
          <Row>
            <Column
              style={{ padding: "16px", width: "200px", verticalAlign: "top" }}
            >
              <Img
                src={PLACEHOLDER_EVENT_IMAGE_URL}
                alt={eventName}
                style={{
                  display: "block",
                  width: "180px",
                  height: "auto",
                }}
              />
            </Column>
            <Column
              className="p-2"
              style={{ verticalAlign: "top", paddingTop: "16px" }}
            >
              <Text className="text-sm font-semibold leading-4 m-1">
                {eventName}
              </Text>
              <Text className="text-sm leading-4 m-1">{position}</Text>
              <Text className="text-sm leading-4 m-1">
                Participants: {filledSlots}
              </Text>
              <Text
                className="text-sm leading-4 m-1"
                style={{ whiteSpace: "nowrap" }}
              >
                {date} at {startTime} - {endTime}
              </Text>
              <Text className="text-sm leading-4 m-1">{location}</Text>
            </Column>
          </Row>
        </Container>

        {/* Change of Plans */}
        <Section className="mt-6 text-center">
          <Text className="text-sm m-0">
            Change of plans? Edit Sign Up{" "}
            <Link href="https://boston-community-pediatrics.vercel.app">
              Here
            </Link>
          </Text>
        </Section>
      </Section>
    </BaseLayoutTemplate>
  );
}
