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

// Could be good for actual event, but info should already be there on sign up
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
}: SignedUpTemplateProps){
  return (
    <BaseLayoutTemplate>
      <Section className="py-6 px-8">
        <Text className="text-sm mt-3">Dear {firstName},</Text>
        <Text className="text-sm m-6">You made itttt</Text>
        <Text className="text-base font-bold">Your upcoming volunteering event</Text>
        <Container className="mt-5 border border-gray-300 bg-white">
          <Row>
            <Column width="140px" className="p-2">
              <Img
                src={`${BASE_URL}/event`} //again change this to actual event bucket 
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
        <Section className="mt-6 p-2">
          <Text className="text-sm leading-4 m-1">
            Change of plans? {" "}
            Edit Sign Up {" "}
            <Link href="https://boston-community-pediatrics.vercel.app">
              Here
            </Link>
          </Text>
          <Text className="text-sm mt-4">Boston Community Pediatrics Team</Text>
        </Section>
      </Section>
    </BaseLayoutTemplate>
  );
};
