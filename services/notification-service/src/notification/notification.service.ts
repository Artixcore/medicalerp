import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import * as amqp from 'amqplib';
import { Logger } from '@nestjs/common';

@Injectable()
export class NotificationService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(NotificationService.name);
  private readonly queueName = 'notifications';

  async onModuleInit() {
    await this.connectRabbitMQ();
  }

  private async connectRabbitMQ() {
    try {
      const rabbitmqUrl =
        process.env.RABBITMQ_URL ||
        'amqp://ehrms:ehrms_dev_password@localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(this.queueName, {
        durable: true,
      });

      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  async sendNotification(createNotificationDto: CreateNotificationDto): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const message = JSON.stringify({
      ...createNotificationDto,
      createdAt: new Date().toISOString(),
    });

    this.channel.sendToQueue(this.queueName, Buffer.from(message), {
      persistent: true,
    });

    this.logger.log(`Notification queued: ${createNotificationDto.subject}`);
  }

  async sendEmail(
    recipient: string,
    subject: string,
    body: string,
  ): Promise<void> {
    // Placeholder for email sending
    this.logger.log(`Email sent to ${recipient}: ${subject}`);
  }

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    // Placeholder for SMS sending
    this.logger.log(`SMS sent to ${phoneNumber}: ${message}`);
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
  ): Promise<void> {
    // Placeholder for push notification
    this.logger.log(`Push notification sent to ${userId}: ${title}`);
  }

  async processNotification(message: any): Promise<void> {
    const notification = JSON.parse(message.content.toString());

    switch (notification.type) {
      case 'email':
        // Process email notification
        break;
      case 'sms':
        // Process SMS notification
        break;
      case 'push':
        // Process push notification
        break;
      default:
        this.logger.warn(`Unknown notification type: ${notification.type}`);
    }
  }
}

