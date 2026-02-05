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

const BASE_URL = "https://boston-community-pediatrics.vercel.app";

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
      <Section className="py-6 px-8">
        <Text className="text-sm mt-3">Dear {firstName},</Text>
                <Text className="text-sm m-6">Womp Womp you couldn&apos;t sign up</Text>
                <Text className="text-base font-bold">Your (not) upcoming volunteering event</Text>
                <Text className="text-sm leading-4 m-1">Waitlist Status: {waitlistPosition}</Text>
                <Container className="mt-5 border border-gray-300 bg-white">
                  <Row>
                    <Column width="140px" className="p-2">
                      <Img
                        src={`${BASE_URL}/event`}
                        alt={eventName}
                        width="90"
                      />
                    </Column>
        
                    <Column className="p-2">
                      <Text className="text-sm font-semibold leading-4 m-1">{eventName}</Text>
                      <Text className="text-sm leading-4 m-1">{position}</Text>
                      <Text className="text-sm leading-4 m-1">Participants: {filledSlots}</Text>
                      <Text className="text-sm leading-4 m-1">
                        {date} at {startTime} - {endTime}
                      </Text>
                      <Text className="text-sm leading-4 m-1">{location}</Text>
                    </Column>
                  </Row>
                </Container>
          <Text>Boston Community Pediatrics Team</Text>
        </Section>
    </BaseLayoutTemplate>
  );
}
