type NtfyNotification = {
  topic: string;
  title: string;
  message: string;
  tags?: string;
};

const NTFY_BASE_URL = "https://ntfy.sh";

// Sends a best-effort ntfy notification without failing the caller on delivery errors.
export async function sendNtfyNotification({ topic, title, message, tags }: NtfyNotification) {
  try {
    const res = await fetch(`${NTFY_BASE_URL}/${topic}`, {
      method: "POST",
      body: message,
      headers: {
        Title: title,
        ...(tags ? { Tags: tags } : {}),
      },
    });
    const responseText = await res.text();

    if (!res.ok) {
      console.warn(`Failed to send ntfy notification to ${topic}: ${res.status} ${res.statusText} ${responseText}`);
      return;
    }

    console.info(`Sent ntfy notification to ${topic}: ${responseText}`);
  } catch (e) {
    console.warn(`Failed to send ntfy notification to ${topic}`, e);
  }
}
