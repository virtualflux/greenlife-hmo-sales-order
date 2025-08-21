export function isValidObjectId(id: string | null | undefined): boolean {
  if (!id || typeof id !== "string") return false;

  // Check if it's exactly 24 characters and only contains hex characters
  if (id.length !== 24) return false;

  const hexPattern = /^[0-9a-fA-F]+$/;
  return hexPattern.test(id);
}
