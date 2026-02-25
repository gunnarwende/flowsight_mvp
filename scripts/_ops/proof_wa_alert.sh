#!/usr/bin/env bash
# Proof: trigger CASE_CREATE_FAILED → WhatsApp RED alert
# Uses a nonexistent tenant UUID → DB foreign key error → notify fires
# Zero PII in command or output (only UUIDs + status codes)

set -e

TARGET="${1:-https://flowsight-mvp.vercel.app}"
FAKE_TENANT="00000000-0000-0000-0000-000000000000"

echo "=== WhatsApp Alert Proof ==="
echo "Target: ${TARGET}/api/cases"
echo "Trigger: CASE_CREATE_FAILED (fake tenant_id → FK error)"
echo ""

HTTP_CODE=$(curl -s -o /tmp/wa_proof_response.json -w "%{http_code}" \
  -X POST "${TARGET}/api/cases" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"${FAKE_TENANT}\",
    \"source\": \"wizard\",
    \"contact_phone\": \"+00000000000\",
    \"street\": \"Test\",
    \"house_number\": \"0\",
    \"plz\": \"0000\",
    \"city\": \"Proof\",
    \"category\": \"Test\",
    \"urgency\": \"normal\",
    \"description\": \"WA alert proof\"
  }")

echo "HTTP Status: ${HTTP_CODE}"
echo "Response:"
cat /tmp/wa_proof_response.json 2>/dev/null
echo ""
echo ""

if [ "$HTTP_CODE" = "500" ]; then
  echo "✓ Expected 500 (FK error). Check WhatsApp for RED alert."
  echo "  Evidence: Vercel Logs → _tag:cases_api decision:failed wa_sent:true"
else
  echo "⚠ Unexpected status ${HTTP_CODE}. May need investigation."
fi

rm -f /tmp/wa_proof_response.json
