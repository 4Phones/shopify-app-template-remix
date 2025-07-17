import {
  Box,
  Button,
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  Scrollable,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useEffect, useRef, useState } from "react";

export default function SettingsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function fetchLogs(silent = false) {
    try {
      if (!silent) setLoading(true);
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data.logs);
      setLastUpdated(new Date());

      // Check if user is near bottom (within 50px)
      const scrollEl = scrollRef.current;
      if (scrollEl) {
        const { scrollTop, scrollHeight, clientHeight } = scrollEl;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

        if (isNearBottom) {
          setTimeout(() => {
            scrollEl.scrollTo({
              top: scrollEl.scrollHeight,
              behavior: "smooth",
            });
          }, 50);
        }
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function clearLogs() {
    try {
      setClearing(true);
      await fetch("/api/logs/clear", { method: "POST" });
      await fetchLogs(); // will auto-scroll after clear
    } catch (err) {
      console.error("Failed to clear logs", err);
    } finally {
      setClearing(false);
    }
  }

  useEffect(() => {
    fetchLogs();

    const interval = setInterval(() => {
      fetchLogs(true);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Page>
      <TitleBar title="Settings page" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Live App Logs (latest 100)
                </Text>
                <Button onClick={clearLogs} loading={clearing}>
                  Clear Logs
                </Button>
              </InlineStack>

              <Text as="p" variant="bodySm" color="subdued">
                Last updated:{" "}
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString()
                  : "Fetching..."}
              </Text>

              <Scrollable shadow style={{ height: "300px" }} ref={scrollRef}>
                <Box padding="200">
                  {loading ? (
                    <Text as="p" variant="bodyMd">
                      Loading logs...
                    </Text>
                  ) : logs.length === 0 ? (
                    <Text as="p" variant="bodyMd">
                      No logs yet.
                    </Text>
                  ) : (
                    logs.map((log, idx) => (
                      <Text
                        key={idx}
                        as="p"
                        variant="bodySm"
                        fontWeight="regular"
                        color="subdued"
                      >
                        {log}
                      </Text>
                    ))
                  )}
                </Box>
              </Scrollable>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
