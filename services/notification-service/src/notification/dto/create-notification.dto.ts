import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  IsUUID,
} from 'class-validator';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  ALERT = 'alert',
  REMINDER = 'reminder',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsArray()
  @IsUUID('4', { each: true })
  recipientIds: string[];

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

