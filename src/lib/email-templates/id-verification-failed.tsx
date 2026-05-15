import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface IdVerificationFailedProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  bookingId?: string;
  bookingRef?: string;
  unitName?: string;
  moveInDate?: string;
  stripeSessionId?: string;
  stripeStatus?: string;
  failureReason?: string;
  failureCode?: string;
}

const Row = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <>
      <Text style={lbl}>{label}</Text>
      <Text style={val}>{value}</Text>
    </>
  ) : null;

const IdVerificationFailedEmail = (props: IdVerificationFailedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>ID verification failed — manual follow-up needed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>ID verification failed</Heading>
        <Text style={text}>
          Stripe Identity could not verify this customer, but their booking has
          been completed and pushed through to Storeganise so the move-in is
          not delayed. Please follow up manually to verify their ID.
        </Text>

        <Section style={card}>
          <Row label="Customer name" value={props.customerName} />
          <Row label="Email" value={props.customerEmail} />
          <Row label="Phone" value={props.customerPhone} />
          <Hr style={hr} />
          <Row label="Unit" value={props.unitName} />
          <Row label="Move-in date" value={props.moveInDate} />
          <Row label="Booking ref" value={props.bookingRef} />
          <Row label="Booking ID" value={props.bookingId} />
          <Hr style={hr} />
          <Row label="Stripe status" value={props.stripeStatus} />
          <Row label="Failure code" value={props.failureCode} />
          <Row label="Failure reason" value={props.failureReason} />
          <Row label="Stripe session" value={props.stripeSessionId} />
        </Section>

        <Text style={footer}>
          Sent automatically by Big Top Self Storage.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: IdVerificationFailedEmail,
  subject: (d: Record<string, any>) =>
    `ID verification failed — ${d.customerEmail ?? d.customerName ?? "customer"} (manual follow-up)`,
  displayName: "ID verification failed (admin)",
  to: "hi@bigtopselfstorage.com",
  previewData: {
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    customerPhone: "07000 000000",
    bookingId: "abc-123",
    bookingRef: "ABC123",
    unitName: "A-12",
    moveInDate: "2026-05-20",
    stripeSessionId: "vs_1ABC",
    stripeStatus: "requires_input",
    failureReason: "Document image is blurry",
    failureCode: "document_unverified_other",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "24px", maxWidth: "560px" };
const h1 = { fontSize: "22px", fontWeight: "bold", color: "#000", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#444", lineHeight: "1.5", margin: "0 0 20px" };
const card = { background: "#fff7ed", borderRadius: "8px", padding: "16px 20px", border: "1px solid #fed7aa" };
const lbl = { fontSize: "11px", textTransform: "uppercase" as const, color: "#888", margin: "10px 0 2px", letterSpacing: "0.5px" };
const val = { fontSize: "14px", color: "#111", margin: "0", fontWeight: 500 };
const hr = { borderColor: "#fed7aa", margin: "14px 0" };
const footer = { fontSize: "12px", color: "#999", margin: "24px 0 0" };
