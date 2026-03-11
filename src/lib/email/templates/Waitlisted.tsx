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

const BASE_URL = "https://boston-community-pediatrics-5ntupemwm.vercel.app/";
const PLACEHOLDER_EVENT_IMAGE_URL = `${BASE_URL}/event1.jpg`;

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
}

// For both signed up and waitlist just am lazy, probably can do a filledslots / total slots

// Same stuff from sign up applies

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
      </Section>
    </BaseLayoutTemplate>
  );
}
