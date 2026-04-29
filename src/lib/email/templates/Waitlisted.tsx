import * as React from "react";
import { BaseLayoutTemplate } from "./BaseLayout";
import {
  Section,
  Text,
  Container,
  Row,
  Column,
  Img,
} from "@react-email/components";

const PLACEHOLDER_EVENT_IMAGE_URL = "https://boston-community-pediatrics-5ntupemwm.vercel.app/event1.jpg";

interface WaitlistedProps {
  firstName?: string;
  eventName: string;
  position: string;
  startTime: string;
  endTime: string;
  date: string;
  filledSlots: number;
  waitlistPosition: number;
  location: string;
  eventImage?: string;
}

export function WaitlistedTemplate({
  firstName,
  eventName,
  position,
  startTime,
  endTime,
  filledSlots,
  waitlistPosition,
  location,
  date,
  eventImage,
}: WaitlistedProps) {
  return (
    <BaseLayoutTemplate>
      <Section className="bg-white px-6 py-6">
        {/* General Message */}
        <Text className="text-sm mt-0 mb-4">
          Dear <strong>{firstName}</strong>,
        </Text>

        <Text className="text-sm mt-0 mb-6" style={{ marginLeft: "10px" }}>
          Thank you for signing up to support <b>{eventName}</b>. Slots for this
          shift are currently full, and you have been placed on a waitlist.
          Should space become available, we will notify you as soon as possible.
          We are grateful for your time and support!
        </Text>

        <Text
          className="text-sm mt-0 mb-4 font-semibold"
          style={{ marginLeft: "0" }}
        >
          Waitlist Position: {waitlistPosition}
        </Text>

        <Text
          className="text-base font-semibold text-gray-900 mb-3"
          style={{ marginLeft: "0" }}
        >
          Upcoming volunteering event:
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
      </Section>
    </BaseLayoutTemplate>
  );
}
