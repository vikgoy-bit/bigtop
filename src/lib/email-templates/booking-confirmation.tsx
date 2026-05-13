import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

const SITE_NAME = "Big Top Self Storage";

interface BookingConfirmationProps {
  customerName?: string;
  unitName?: string;
  unitTitle?: string;
  moveInDate?: string;
  monthlyPrice?: string;
  contractUrl?: string;
  coverDocumentUrl?: string;
  bookingRef?: string;
}

const BookingConfirmationEmail = ({
  customerName,
  unitName,
  unitTitle,
  moveInDate,
  monthlyPrice,
  contractUrl,
  coverDocumentUrl,
  bookingRef,
}: BookingConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Big Top Self Storage booking is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're all booked in 🎉</Heading>
        <Text style={text}>
          {customerName ? `Hi ${customerName}, ` : "Hi, "}thanks for choosing
          {" "}
          {SITE_NAME}. Your storage unit is reserved and your signed agreement is
          attached below.
        </Text>

        <Section style={card}>
          {unitName ? (
            <>
              <Text style={label}>Unit number</Text>
              <Text style={value}>{unitName}</Text>
            </>
          ) : null}

          {unitTitle ? (
            <>
              <Text style={label}>Unit type</Text>
              <Text style={value}>{unitTitle}</Text>
            </>
          ) : null}

          {moveInDate ? (
            <>
              <Text style={label}>Move-in date</Text>
              <Text style={value}>{moveInDate}</Text>
            </>
          ) : null}

          {monthlyPrice ? (
            <>
              <Text style={label}>Monthly price</Text>
              <Text style={value}>{monthlyPrice}</Text>
            </>
          ) : null}

          {bookingRef ? (
            <>
              <Text style={label}>Booking reference</Text>
              <Text style={value}>{bookingRef}</Text>
            </>
          ) : null}
        </Section>

        {contractUrl ? (
          <Section style={{ textAlign: "center", margin: "28px 0 12px" }}>
            <Button style={button} href={contractUrl}>
              Download your signed agreement
            </Button>
          </Section>
        ) : null}

        {coverDocumentUrl ? (
          <Section style={{ textAlign: "center", margin: "0 0 12px" }}>
            <Button style={buttonSecondary} href={coverDocumentUrl}>
              Download your uploaded ID / cover document
            </Button>
          </Section>
        ) : null}

        {(contractUrl || coverDocumentUrl) ? (
          <Text style={{ ...hint, textAlign: "center" as const }}>
            These download links are valid for 30 days.
          </Text>
        ) : null}

        <Text style={text}>
          Bring photo ID on move-in day. If anything changes, just reply to this
          email and the team will help.
        </Text>

        <Text style={footer}>— The {SITE_NAME} team</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: BookingConfirmationEmail,
  subject: "Your Big Top Self Storage booking is confirmed",
  displayName: "Booking confirmation",
  previewData: {
    customerName: "Jane",
    unitName: "B12",
    unitTitle: "50 sq ft Medium",
    moveInDate: "1 June 2026",
    monthlyPrice: "£89.00 per month",
    contractUrl: "https://example.com/agreement.pdf",
    bookingRef: "abc12345",
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
};
const container = { padding: "32px 28px", maxWidth: "560px" };
const h1 = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#0b1f3a",
  margin: "0 0 16px",
};
const text = {
  fontSize: "14px",
  color: "#3f4b5d",
  lineHeight: "1.6",
  margin: "0 0 16px",
};
const card = {
  border: "1px solid #e6e8ee",
  borderRadius: "10px",
  padding: "16px 18px",
  margin: "16px 0 8px",
};
const label = {
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  color: "#7a8497",
  margin: "10px 0 2px",
};
const value = {
  fontSize: "14px",
  color: "#0b1f3a",
  margin: "0 0 4px",
};
const button = {
  backgroundColor: "#ffb500",
  color: "#0b1f3a",
  borderRadius: "8px",
  padding: "12px 22px",
  fontSize: "14px",
  fontWeight: 700,
  textDecoration: "none",
};
const hint = {
  fontSize: "12px",
  color: "#7a8497",
  margin: "10px 0 0",
};
const footer = {
  fontSize: "12px",
  color: "#9aa3b2",
  margin: "28px 0 0",
};
