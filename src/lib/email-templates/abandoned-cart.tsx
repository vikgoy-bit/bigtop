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

interface AbandonedCartProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  unitName?: string;
  unitSize?: string;
  monthlyPrice?: string;
  moveInDate?: string;
  tierLabel?: string;
  bookingId?: string;
  bookingRef?: string;
  createdAt?: string;
  minutesSince?: number;
}

const Row = ({ label, value }: { label: string; value?: string | number }) =>
  value ? (
    <>
      <Text style={lbl}>{label}</Text>
      <Text style={val}>{String(value)}</Text>
    </>
  ) : null;

const AbandonedCartEmail = (props: AbandonedCartProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Abandoned booking — {props.customerEmail ?? "unknown"}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Abandoned booking</Heading>
        <Text style={text}>
          A customer started a booking but hasn't completed checkout in{" "}
          {props.minutesSince ?? 15}+ minutes.
        </Text>

        <Section style={card}>
          <Row label="Customer name" value={props.customerName} />
          <Row label="Email" value={props.customerEmail} />
          <Row label="Phone" value={props.customerPhone} />
          <Row label="Address" value={props.address} />
          <Hr style={hr} />
          <Row label="Unit" value={props.unitName} />
          <Row label="Size" value={props.unitSize} />
          <Row label="Move-in date" value={props.moveInDate} />
          <Row label="Cover tier" value={props.tierLabel} />
          <Row label="Monthly price" value={props.monthlyPrice} />
          <Hr style={hr} />
          <Row label="Booking ref" value={props.bookingRef} />
          <Row label="Booking ID" value={props.bookingId} />
          <Row label="Started at" value={props.createdAt} />
        </Section>

        <Text style={footer}>
          Sent automatically by Big Top Self Storage.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: AbandonedCartEmail,
  subject: (d: Record<string, any>) =>
    `Abandoned booking — ${d.customerEmail ?? d.customerName ?? "customer"}`,
  displayName: "Abandoned cart (admin)",
  to: "hi@bigtopselfstorage.com",
  previewData: {
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    customerPhone: "07000 000000",
    address: "1 Example Street, Manchester, M1 1AA",
    unitName: "A-12",
    unitSize: "50 sqft",
    monthlyPrice: "£120.00",
    moveInDate: "2026-05-20",
    tierLabel: "£4,000 cover",
    bookingId: "abc-123",
    bookingRef: "ABC123",
    createdAt: "2026-05-14 14:00",
    minutesSince: 17,
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "24px", maxWidth: "560px" };
const h1 = { fontSize: "22px", fontWeight: "bold", color: "#000", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#444", lineHeight: "1.5", margin: "0 0 20px" };
const card = { background: "#f6f6f6", borderRadius: "8px", padding: "16px 20px" };
const lbl = { fontSize: "11px", textTransform: "uppercase" as const, color: "#888", margin: "10px 0 2px", letterSpacing: "0.5px" };
const val = { fontSize: "14px", color: "#111", margin: "0", fontWeight: 500 };
const hr = { borderColor: "#e2e2e2", margin: "14px 0" };
const footer = { fontSize: "12px", color: "#999", margin: "24px 0 0" };
