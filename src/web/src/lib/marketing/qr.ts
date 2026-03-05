import QRCode from "qrcode";

/**
 * Generate a scannable QR code as SVG string.
 * Uses the `qrcode` library for proper QR encoding.
 */
export async function generateQrSvg(url: string, size = 120): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    width: size,
    margin: 0,
    color: { dark: "#0f1a2e", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}
