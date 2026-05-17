import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface ErrorAlertProps {
  source?: string;
  message?: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  occurredAt?: string;
  extra?: string;
}

const ErrorAlertEmail = ({
  source,
  message,
  stack,
  url,
  userAgent,
  userId,
  occurredAt,
  extra,
}: ErrorAlertProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`[bigtop] ${source ?? "error"}: ${message ?? "Unknown error"}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Error: {source ?? "unknown"}</Heading>
        <Text style={text}>
          <strong>Message:</strong> {message ?? "(no message)"}
        </Text>
        {occurredAt && (
          <Text style={meta}>
            <strong>When:</strong> {occurredAt}
          </Text>
        )}
        {url && (
          <Text style={meta}>
            <strong>URL:</strong> {url}
          </Text>
        )}
        {userId && (
          <Text style={meta}>
            <strong>User:</strong> {userId}
          </Text>
        )}
        {userAgent && (
          <Text style={meta}>
            <strong>User-Agent:</strong> {userAgent}
          </Text>
        )}
        {stack && (
          <Section>
            <Text style={metaLabel}>Stack:</Text>
            <pre style={pre}>{stack}</pre>
          </Section>
        )}
        {extra && (
          <Section>
            <Text style={metaLabel}>Context:</Text>
            <pre style={pre}>{extra}</pre>
          </Section>
        )}
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: ErrorAlertEmail,
  subject: (d: Record<string, any>) =>
    `[bigtop] ${d.source ?? "error"}: ${(d.message ?? "Unknown error").slice(0, 120)}`,
  displayName: "Error alert",
  to: "Hi@bigtopselfstorage.com",
  previewData: {
    source: "server:storeganise.createMoveIn",
    message: "duplicate move-in job",
    stack: "Error: duplicate move-in job\n    at createMoveIn (storeganise.server.ts:412)",
    url: "/book/contract",
    occurredAt: new Date().toISOString(),
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px", maxWidth: "640px" };
const h1 = { fontSize: "20px", fontWeight: "bold" as const, color: "#b91c1c", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#1f2937", lineHeight: "1.5", margin: "0 0 8px" };
const meta = { fontSize: "13px", color: "#374151", margin: "0 0 4px" };
const metaLabel = { fontSize: "13px", color: "#374151", fontWeight: "bold" as const, margin: "16px 0 4px" };
const pre = {
  fontSize: "12px",
  color: "#111827",
  background: "#f3f4f6",
  padding: "12px",
  borderRadius: "6px",
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-word" as const,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};
