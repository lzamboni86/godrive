import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  async sendMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.chatService.sendMessage(createMessageDto, req.user.id);
  }

  @Get(':chatId/messages')
  async getMessages(@Param('chatId') chatId: string, @Request() req) {
    return this.chatService.getMessages(chatId, req.user.id);
  }

  @Get('lesson/:lessonId')
  async getChatByLesson(@Param('lessonId') lessonId: string, @Request() req) {
    return this.chatService.getChatByLesson(lessonId, req.user.id);
  }

  @Get(':chatId/can-send')
  async canSendMessage(@Param('chatId') chatId: string, @Request() req) {
    const canSend = await this.chatService.canSendMessage(chatId, req.user.id);
    return { canSend };
  }
}
