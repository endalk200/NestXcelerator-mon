export class UserCreatedEvent {
  constructor(
    public userId: string,
    public payload: {
      fullName: string;
      email: string;
    },
  ) {}
}
