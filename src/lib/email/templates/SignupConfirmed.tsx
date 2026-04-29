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

const PLACEHOLDER_EVENT_IMAGE_URL = "https://boston-community-pediatrics-5ntupemwm.vercel.app/event1.jpg";

interface SignedUpTemplateProps {
  firstName: string;
  eventName: string;
  position: string;
  startTime: string;
  endTime: string;
  date: string;
  filledSlots: number;
  location: string;
  eventImage?: string;
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
  eventImage,
}: SignedUpTemplateProps) {
  return (
    <BaseLayoutTemplate>
      <Section className="py-6 px-8">
        {/* General Message */}
        <Text className="text-sm mt-0 mb-4">
          Dear <strong>{firstName}</strong>,
        </Text>

        <Text className="text-sm mt-0 mb-6" style={{ marginLeft: "10px" }}>
          Thank you for signing up to support <b>{eventName}</b>. Please see
          below for your confirmed volunteer shift details. If you have any
          questions, please do not hesitate to reach out. We are grateful for
          your time and support!
        </Text>

        <Text className="text-base font-bold mt-6 mb-3">
          Your upcoming volunteering event
        </Text>

        {/* Event Card */}
        <Container className="border border-gray-300 bg-white p-0" style={{ margin: "0 auto" }}>
          <Row>
            <Column
              style={{ padding: "16px", width: "120px", verticalAlign: "middle", textAlign: "center" }}
            >
              <Img
                src={eventImage || PLACEHOLDER_EVENT_IMAGE_URL}
                alt={eventName}
                width="100"
                height="100"
                style={{
                  display: "block",
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  objectPosition: "center",
                  margin: "0 auto",
                }}
              />
            </Column>
            <Column
              style={{ verticalAlign: "middle", padding: "16px 16px 16px 0" }}
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
