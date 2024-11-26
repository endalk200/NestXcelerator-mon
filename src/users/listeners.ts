import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserCreatedEvent } from "./events";

@Injectable()
export class UserEventListener {
  private readonly logger = new Logger(UserEventListener.name);

  constructor() {}

  @OnEvent("user.created", { async: true })
  async userCreatedEventHandler(event: UserCreatedEvent) {
    this.logger.log(`New user with id: ${event.userId} has been created`);
  }
}
