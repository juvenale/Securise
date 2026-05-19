import { getStore } from "@netlify/blobs";

const store = getStore("sy701-progress-sync");

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,PUT,OPTIONS",
      "access-control-allow-headers": "content-type"
    },
    body: JSON.stringify(body)
  };
}

function validCode(code) {
  return typeof code === "string" && /^[a-zA-Z0-9._:-]{12,120}$/.test(code);
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return response(204, {});

  const code = event.queryStringParameters?.code || "";
  if (!validCode(code)) return response(400, { error: "Invalid sync code." });

  if (event.httpMethod === "GET") {
    const payload = await store.get(code, { type: "json" });
    if (!payload) return response(404, { error: "No sync data." });
    return response(200, payload);
  }

  if (event.httpMethod === "PUT") {
    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch {
      return response(400, { error: "Invalid JSON." });
    }

    if (!payload || payload.version !== 1 || !payload.iv || !payload.data || !payload.updatedAt) {
      return response(400, { error: "Invalid sync payload." });
    }

    await store.setJSON(code, payload);
    return response(200, { ok: true, updatedAt: payload.updatedAt });
  }

  return response(405, { error: "Method not allowed." });
}
