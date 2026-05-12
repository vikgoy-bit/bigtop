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

interface InsuranceCoverProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  unitTitle?: string;
  moveInDate?: string;
  downloadUrl?: string;
}

const InsuranceCoverEmail = ({
  customerName,
  customerEmail,
  customerPhone,
  unitTitle,
  moveInDate,
  downloadUrl,
}: InsuranceCoverProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      Insurance proof uploaded by {customerName ?? "a new customer"}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Insurance cover uploaded</Heading>
        <Text style={text}>
          A customer has chosen to use their own insurance and uploaded proof of
          cover.
        </Text>

        <Section style={card}>
          <Text style={label}>Customer</Text>
          <Text style={value}>{customerName ?? "—"}</Text>

          <Text style={label}>Email</Text>
          <Text style={value}>{customerEmail ?? "—"}</Text>

          {customerPhone ? (
            <>
              <Text style={label}>Phone</Text>
              <Text style={value}>{customerPhone}</Text>
            </>
          ) : null}

          {unitTitle ? (
            <>
              <Text style={label}>Unit</Text>
              <Text style={value}>{unitTitle}</Text>
            </>
          ) : null}

          {moveInDate ? (
            <>
              <Text style={label}>Move-in date</Text>
              <Text style={value}>{moveInDate}</Text>
            </>
          ) : null}
        </Section>

        {downloadUrl ? (
          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Button style={button} href={downloadUrl}>
              Download cover document
            </Button>
            <Text style={hint}>
              This download link is valid for 7 days.
            </Text>
          </Section>
        ) : (
          <Text style={text}>
            (No download link available — check the booking record in the admin
            backend.)
          </Text>
        )}

        <Text style={footer}>Sent automatically by {SITE_NAME}.</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: InsuranceCoverEmail,
  subject: (data: Record<string, any>) =>
    `Insurance - ${data?.customerName ?? "New customer"}`,
  displayName: "Insurance cover proof uploaded",
  to: "hi@bigtopselfstorage.com",
  previewData: {
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    customerPhone: "07700 900123",
    unitTitle: "50 sq ft",
    moveInDate: "2026-06-01",
    downloadUrl: "https://example.com/cover.pdf",
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
