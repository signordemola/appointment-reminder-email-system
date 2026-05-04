export interface CreateContactDto {
  fullName: string;
  email: string;
  phone?: string | null;
  timezone: string;
  emailOptOut: boolean;
}
