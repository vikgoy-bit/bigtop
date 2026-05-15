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

interface InternalContractCopyProps {
  customerName?: string;
  customerEmail?: string;
  unitName?: string;
  unitTitle?: string;
  moveInDate?: string;
  signedAt?: string;
  bookingRef?: string;
  contractUrl?: string;
}

const InternalContractCopyEmail = ({
  customerName,
  customerEmail,
  unitName,
  unitTitle,
  moveInDate,
  signedAt,
  bookingRef,
  contractUrl,
}: InternalContractCopyProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Signed storage agreement — {customerName ?? customerEmail ?? "new booking"}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New signed agreement</Heading>
        <Text style={text}>
          A customer has just signed their {SITE_NAME} storage agreement. A
          copy of the signed PDF is linked below for your records.
        </Text>

        <Section style={card}>
          {customerName ? (
            <>
              <Text style={label}>Customer</Text>
              <Text style={value}>{customerName}</Text>
            </>
          ) : null}

          {customerEmail ? (
            <>
              <Text style={label}>Email</Text>
              <Text style={value}>{customerEmail}</Text>
            </>
          ) : null}

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

          {signedAt ? (
            <>
              <Text style={label}>Signed at</Text>
              <Text style={value}>{signedAt}</Text>
            </>
          ) : null}

          {bookingRef ? (
            <>
              <Text style={label}>Booking ref</Text>
              <Text style={value}>{bookingRef}</Text>
            </>
          ) : null}
        </Section>

        {contractUrl ? (
          <Section style={{ margin: "24px 0 4px" }}>
            <Button href={contractUrl} style={button}>
              Download signed agreement (PDF)
            </Button>
            <Text style={hint}>Link valid for 30 days.</Text>
          </Section>
        ) : (
          <Text style={hint}>
            The signed PDF was generated but no download link is available — check
            the booking record in the admin dashboard.
          </Text>
        )}

        <Text style={footer}>Automated notification from {SITE_NAME}.</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: InternalContractCopyEmail,
  subject: (data: Record<string, any>) =>
    `Signed agreement — ${data.customerName || data.customerEmail || "new booking"}${data.unitName ? ` (Unit ${data.unitName})` : ""}`,
  to: "hi@bigtopselfstorage.com",
  displayName: "Internal — signed contract copy",
  previewData: {
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    unitName: "A12",
    unitTitle: "Medium 50 sqft",
    moveInDate: "15 May 2026",
    signedAt: "15 May 2026, 14:00 BST",
    bookingRef: "abc12345",
    contractUrl: "https://example.com/contract.pdf",
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
  backgroundColor: "#0b1f3a",
  color: "#ffffff",
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
