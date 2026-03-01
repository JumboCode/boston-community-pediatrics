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

interface RemovedTemplateProps {
  firstName: string;
  eventName: string;
  position: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
}

export function RemovedTemplate({
  firstName,
  eventName,
  position,
  startTime,
  endTime,
  location,
  date,
}: RemovedTemplateProps) {
  return (
    <BaseLayoutTemplate>
      <Section className="py-6 px-8">

        {/* General Message */}
        <Text className="text-sm mt-0 mb-4">
          Dear <strong>{firstName}</strong>,
        </Text>

        <Text className="text-sm font-bold mt-0 mb-6" style={{ marginLeft: "10px" }}>
          You were removed from the following event:
        </Text>
        
        {/* <Text className="text-base font-bold mt-6 mb-3">
          Your upcoming volunteering event
        </Text> 
        
        Trying to see what looks like before

        */} 

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
              <Text className="text-sm font-semibold leading-4 mt-1 mb-2">
                {eventName}
              </Text>
              <Text className="text-sm leading-4 mt-3 mb-1">{position}</Text>

              {/* <Text className="text-sm leading-4 m-1">
                Participants: {filledSlots}
              </Text> */}
              
              <Text
                className="text-sm leading-4 mt-3 mb-1"
                style={{ whiteSpace: "nowrap" }}
              >
                {date} at {startTime} - {endTime}
              </Text>
              <Text className="text-sm leading-4 mt-3 mb-0">{location}</Text>
            </Column>
          </Row>
        </Container>

        {/* Make a Mistake */}
        <Section className="mt-6 text-center">
          <Text className="text-sm m-0">
            If this was an error please edit sign your sign up{" "}
            <Link href="https://boston-community-pediatrics.vercel.app">
              here
            </Link>
          </Text>
        </Section>
      </Section>
    </BaseLayoutTemplate>
  );
}
