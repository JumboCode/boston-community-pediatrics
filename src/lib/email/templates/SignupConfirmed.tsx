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
const PLACEHOLDER_EVENT_IMAGE_URL = `${BASE_URL}/event1.jpg`; //only works when branch catches up to main

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
}: SignedUpTemplateProps) {
  return (
    <BaseLayoutTemplate>
      <Section className="py-6 px-8">
        <Text className="text-sm mt-0 mb-4">
          Dear <strong>{firstName}</strong>,
        </Text>
        <Text className="text-sm mt-0 mb-6">
          {" "}
          Lorem ipsum dolor sit amet consectetur. Etiam ultrices sed eget
          sagittis. Nibh massa libero volutpat vitae nulla nunc. Velit massa
          eget quam diam non feugiat non pellentesque. Mauris lacinia elit sit
          dolor arcu praesentarcu dictum lacus ut amet ac. Blandit viverra ut
          vitae metus orci. Lobortis sed dictum mattis nec malesuada fringilla
          tempus. Magna ut amet velit odio ac ac. Fringilla adipiscing at dui
          tortor in varius eu. Tellus pellentesque sodales pretium tempus ornare
          magna mattis. Imperdiet tellus a at eras. Pulvinar lorem nulla ut nunc
          sit. Posuere tincidunt ultrices arcu sed pretium pharetra arcu tortor.
          Bibendum sed tortor pretium enem enim adipiscing. Nullam integer
          facilisis et vel sed pretium pellentesque consequat nisl.
        </Text>
        <Text className="text-base font-bold mt-6 mb-4">
          Your upcoming volunteering event
        </Text>
        <Container
          className="mt-5 border border-gray-300 bg-white p-0 m-0"
          // style={{
          //   border: "1px solid #D1D5DB",
          //   borderRadius: "6px",
          //   margin: "16px 0 32px 0",
          //   marginBottom: "32px",
          //   width: "100%",
          // }}
        >
          <Row>
            <Column
              style={{ padding: "16px" }}
            >
              <Img
                src={PLACEHOLDER_EVENT_IMAGE_URL}
                alt={eventName}
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: "180px",
                  height: "auto",
                  margin: "0 auto",
                }}
              />
            </Column>
            <Column
              style={{ padding: "0 18px 16px" }}
            >
              <Text
                style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 600 }}
              >
                {eventName}
              </Text>

              <Text
                style={{
                  margin: "0 0 4px",
                  fontSize: "13px",
                }}
                className="text-sm"
              >
                {position}
              </Text>

              <Text
                style={{
                  margin: "0 0 4px",
                  fontSize: "13px",
                }}
                className="text-sm"
              >
                Participants: {filledSlots}
              </Text>

              <Text
                style={{
                  margin: "0 0 4px",
                  fontSize: "13px",
                }}
                className="text-sm"
              >
                {date} from {startTime} - {endTime}
              </Text>

              <Text style={{ margin: 0, fontSize: "13px" }} className="text-sm">
                {location}
              </Text>
            </Column>
          </Row>
        </Container>
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
