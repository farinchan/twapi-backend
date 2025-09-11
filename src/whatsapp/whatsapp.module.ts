import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappGateway } from './whatsapp.gateway';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappGateway]
})
export class WhatsappModule {}
