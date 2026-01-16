import { IsEmail, IsString, IsEnum } from 'class-validator';

export enum ContactPreference {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email'
}

export class ContactForm {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  message: string;

  @IsEnum(ContactPreference)
  contactPreference: ContactPreference;
}
