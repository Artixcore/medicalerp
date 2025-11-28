import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  sendNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.sendNotification(createNotificationDto);
  }

  @Post('email')
  sendEmail(
    @Body()
    body: {
      recipient: string;
      subject: string;
      message: string;
    },
  ) {
    return this.notificationService.sendEmail(
      body.recipient,
      body.subject,
      body.message,
    );
  }

  @Post('sms')
  sendSMS(
    @Body()
    body: {
      phoneNumber: string;
      message: string;
    },
  ) {
    return this.notificationService.sendSMS(body.phoneNumber, body.message);
  }

  @Post('push')
  sendPush(
    @Body()
    body: {
      userId: string;
      title: string;
      message: string;
    },
  ) {
    return this.notificationService.sendPushNotification(
      body.userId,
      body.title,
      body.message,
    );
  }
}

