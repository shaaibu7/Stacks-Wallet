import express from "express";
import crypto from "crypto";

const PORT = process.env.PORT || 3001;
const SECRET = process.env.CHAINHOOK_SECRET || "";

const app = express();
app.use(express.json({ type: "*/*" }));

function verifySignature(reqBody, signatureHeader) {
  if (!SECRET) return true; // skip if no secret configured
  if (!signatureHeader) return false;

  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(typeof reqBody === "string" ? reqBody : JSON.stringify(reqBody));
  const digest = `sha256=${hmac.digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
}

app.post("/hooks/stacks", (req, res) => {
  try {
    const sig = req.headers["x-chainhook-signature"];
    if (!verifySignature(req.body, sig)) {
      return res.status(401).send("invalid signature");
    }

    const { block_height, txid, matched_events } = req.body || {};
    console.log("Chainhook match", {
      block_height,
      txid,
      matched_events,
    });

    // TODO: enqueue or persist for downstream processing
    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error", err);
    return res.sendStatus(500);
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Chainhook webhook server listening on http://localhost:${PORT}`);
});

