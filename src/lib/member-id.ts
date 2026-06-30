export const MEMBER_ID_PREFIX = 'WW-';

export function formatPublicMemberId(id?: string | null) {
  if (!id) {
    return '';
  }

  return `${MEMBER_ID_PREFIX}${id.slice(-8).toUpperCase()}`;
}

export function normalizeMemberIdInput(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function getMemberIdLookupSuffix(value: string) {
  const normalized = normalizeMemberIdInput(value);

  if (!normalized) {
    return '';
  }

  const withoutPrefix = normalized.startsWith('WW') ? normalized.slice(2) : normalized;

  if (withoutPrefix.length < 8) {
    return '';
  }

  return withoutPrefix.slice(-8).toLowerCase();
}

export function memberIdMatches(sourceId: string | null | undefined, value: string) {
  if (!sourceId) {
    return false;
  }

  const normalizedInput = normalizeMemberIdInput(value);
  const normalizedSource = normalizeMemberIdInput(sourceId);
  const normalizedPublic = normalizeMemberIdInput(formatPublicMemberId(sourceId));
  const normalizedSuffix = normalizeMemberIdInput(sourceId.slice(-8));

  return (
    normalizedInput === normalizedSource ||
    normalizedInput === normalizedPublic ||
    normalizedInput === normalizedSuffix
  );
}
