// Shared camera diagnostics.
//
// Both camera components used to decide what went wrong by substring-matching
// err.message ("NotAllowed", "Permission"). The name is in err.name, and
// Safari's message text ("The request is not allowed by the user agent or the
// platform in the current context.") matches neither, so on iOS every failure
// fell through to a generic "could not access camera" that told the user
// nothing about the actual cause.

// Why the live camera cannot even be attempted, or "" when it can be.
//
// Over plain http:// the page is not a secure context and the browser does not
// expose navigator.mediaDevices at all — calling getUserMedia throws a
// TypeError that reads like a mysterious failure. There is no code-side fix
// for that, so the honest move is to say it up front and point at the device's
// own camera, which needs no secure context.
export function cameraBlockedReason(): string {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return (
      "The live camera needs a secure connection. Home Assistant is being served over " +
      "http://, and browsers only allow camera access over https:// (or on localhost)."
    );
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "This browser does not offer live camera access.";
  }
  return "";
}

// A getUserMedia failure, in words that suggest what to do about it.
export function describeCameraError(err: any): string {
  switch (err?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera access was denied. Allow it for this site in your browser settings.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No camera found on this device.";
    case "NotReadableError":
    case "AbortError":
      return "The camera is busy or unavailable — another app may be using it.";
    default:
      return `Could not access the camera${err?.name ? ` (${err.name})` : ""}.`;
  }
}
