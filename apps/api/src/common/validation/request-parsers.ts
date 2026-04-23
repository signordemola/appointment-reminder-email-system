import { BadRequestException } from "@nestjs/common";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StringOptions = {
  label?: string;
  minLength?: number;
  maxLength?: number;
  trim?: boolean;
};

function fail(message: string): never {
  throw new BadRequestException(message);
}

function getSingleValue(value: unknown, label: string) {
  if (Array.isArray(value)) {
    fail(`${label} must not be provided more than once.`);
  }

  return value;
}

export function asRecord(value: unknown, label = "request body") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be a JSON object.`);
  }

  return value as Record<string, unknown>;
}

export function parseRequiredString(
  source: Record<string, unknown>,
  key: string,
  options: StringOptions = {},
) {
  const label = options.label ?? key;
  const rawValue = getSingleValue(source[key], label);

  if (typeof rawValue !== "string") {
    fail(`${label} is required.`);
  }

  const value = options.trim === false ? rawValue : rawValue.trim();
  if (options.minLength && value.length < options.minLength) {
    fail(`${label} must be at least ${options.minLength} characters.`);
  }
  if (options.maxLength && value.length > options.maxLength) {
    fail(`${label} must be at most ${options.maxLength} characters.`);
  }
  if (value.length === 0) {
    fail(`${label} is required.`);
  }

  return value;
}

export function parseOptionalString(
  source: Record<string, unknown>,
  key: string,
  options: StringOptions = {},
) {
  if (!(key in source) || source[key] === undefined) {
    return undefined;
  }

  if (source[key] === null) {
    return null;
  }

  return parseRequiredString(source, key, options);
}

export function parseRequiredEmail(source: Record<string, unknown>, key: string, label = key) {
  const email = parseRequiredString(source, key, {
    label,
    maxLength: 320,
  }).toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    fail(`${label} must be a valid email address.`);
  }

  return email;
}

export function parseRequiredDate(source: Record<string, unknown>, key: string, label = key) {
  const rawValue = getSingleValue(source[key], label);

  if (typeof rawValue !== "string") {
    fail(`${label} must be an ISO date string.`);
  }

  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) {
    fail(`${label} must be a valid ISO date string.`);
  }

  return date;
}

export function parseOptionalDate(source: Record<string, unknown>, key: string, label = key) {
  if (!(key in source) || source[key] === undefined) {
    return undefined;
  }

  if (source[key] === null) {
    return null;
  }

  return parseRequiredDate(source, key, label);
}

export function parseRequiredBoolean(
  source: Record<string, unknown>,
  key: string,
  label = key,
) {
  const rawValue = getSingleValue(source[key], label);

  if (typeof rawValue !== "boolean") {
    fail(`${label} must be a boolean.`);
  }

  return rawValue;
}

export function parseOptionalBoolean(
  source: Record<string, unknown>,
  key: string,
  label = key,
) {
  if (!(key in source) || source[key] === undefined) {
    return undefined;
  }

  return parseRequiredBoolean(source, key, label);
}

export function parseRequiredInteger(
  source: Record<string, unknown>,
  key: string,
  label = key,
) {
  const rawValue = getSingleValue(source[key], label);

  if (typeof rawValue !== "number" || !Number.isInteger(rawValue)) {
    fail(`${label} must be an integer.`);
  }

  return rawValue;
}

export function parseOptionalInteger(
  source: Record<string, unknown>,
  key: string,
  label = key,
) {
  if (!(key in source) || source[key] === undefined) {
    return undefined;
  }

  return parseRequiredInteger(source, key, label);
}

export function parseRequiredEnum<T extends string>(
  source: Record<string, unknown>,
  key: string,
  allowedValues: readonly T[],
  label = key,
) {
  const value = parseRequiredString(source, key, { label });

  if (!allowedValues.includes(value as T)) {
    fail(`${label} must be one of: ${allowedValues.join(", ")}.`);
  }

  return value as T;
}

export function parseOptionalEnum<T extends string>(
  source: Record<string, unknown>,
  key: string,
  allowedValues: readonly T[],
  label = key,
) {
  if (!(key in source) || source[key] === undefined) {
    return undefined;
  }

  if (source[key] === null) {
    return null;
  }

  return parseRequiredEnum(source, key, allowedValues, label);
}

export function parseQueryString(
  value: unknown,
  label: string,
  options: StringOptions = {},
) {
  if (value === undefined) {
    return undefined;
  }

  const rawValue = getSingleValue(value, label);
  if (typeof rawValue !== "string") {
    fail(`${label} must be a string.`);
  }

  const nextValue = options.trim === false ? rawValue : rawValue.trim();
  if (nextValue.length === 0) {
    return undefined;
  }
  if (options.maxLength && nextValue.length > options.maxLength) {
    fail(`${label} must be at most ${options.maxLength} characters.`);
  }

  return nextValue;
}

export function parseQueryInteger(
  value: unknown,
  label: string,
  fallback: number,
  min: number,
  max: number,
) {
  if (value === undefined) {
    return fallback;
  }

  const rawValue = getSingleValue(value, label);
  if (typeof rawValue !== "string") {
    fail(`${label} must be a number.`);
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsedValue) || parsedValue < min || parsedValue > max) {
    fail(`${label} must be an integer between ${min} and ${max}.`);
  }

  return parsedValue;
}

export function parseQueryEnum<T extends string>(
  value: unknown,
  label: string,
  allowedValues: readonly T[],
) {
  const nextValue = parseQueryString(value, label);
  if (!nextValue) {
    return undefined;
  }

  if (!allowedValues.includes(nextValue as T)) {
    fail(`${label} must be one of: ${allowedValues.join(", ")}.`);
  }

  return nextValue as T;
}

export function parseRequiredUuid(value: unknown, label: string) {
  const singleValue = getSingleValue(value, label);
  if (typeof singleValue !== "string" || !UUID_PATTERN.test(singleValue)) {
    fail(`${label} must be a valid UUID.`);
  }

  return singleValue;
}

export function parseOptionalUuid(source: Record<string, unknown>, key: string, label = key) {
  if (!(key in source) || source[key] === undefined) {
    return undefined;
  }

  if (source[key] === null) {
    return null;
  }

  return parseRequiredUuid(source[key], label);
}

export function ensureFutureDate(date: Date, label: string) {
  if (date.getTime() <= Date.now()) {
    fail(`${label} must be in the future.`);
  }
}

export function ensureTimeOrder(start: Date, end: Date, label = "endsAtUtc") {
  if (end.getTime() <= start.getTime()) {
    fail(`${label} must be later than startsAtUtc.`);
  }
}

export function ensureValidTimeZone(timeZone: string, label: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
  } catch {
    fail(`${label} must be a valid IANA timezone.`);
  }
}
