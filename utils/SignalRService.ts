// SignalRService.ts
import * as signalR from "@microsoft/signalr";

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  private messageCallbacks: ((msg: {
    conversationId: string;
    senderId: string;
    text: string;
    sentAt: string;
  }) => void)[] = [];

  private historyCallbacks: ((messages: {
    conversationId: string;
    senderId: string;
    text: string;
    sentAt: string;
  }[]) => void)[] = [];

  // TODO: change to your machine IP / port
  // e.g. http://192.168.1.15:5185/chatHub  or  https://localhost:7185/chatHub (emulator)
  private hubUrl = "http://172.16.0.45:5097/chatHub";

  async startConnection(userId: number | string) {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .build();

    // Message from server: ReceiveMessage(msg)
    this.connection.on("ReceiveMessage", (msg: any) => {
      this.messageCallbacks.forEach((cb) => cb(msg));
    });

    // History from server: ConversationHistory(messages)
    this.connection.on("ConversationHistory", (messages: any[]) => {
      this.historyCallbacks.forEach((cb) => cb(messages));
    });

    try {
      await this.connection.start();
      console.log("SignalR connected");
    } catch (err) {
      console.error("SignalR connection error:", err);
    }
  }

  async stopConnection() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.messageCallbacks = [];
      this.historyCallbacks = [];
    }
  }

  async joinConversation(conversationId: string) {
    if (!this.connection) return;
    try {
      await this.connection.invoke("JoinConversation", conversationId);
    } catch (err) {
      console.error("JoinConversation error:", err);
    }
  }

  async sendMessage(
    conversationId: string,
    senderId: number | string,
    text: string
  ) {
    if (!this.connection) return;
    try {
      await this.connection.invoke("SendMessage", conversationId, String(senderId), text);
    } catch (err) {
      console.error("SendMessage error:", err);
    }
  }

  onReceiveMessage(
    callback: (msg: {
      conversationId: string;
      senderId: string;
      text: string;
      sentAt: string;
    }) => void
  ) {
    this.messageCallbacks.push(callback);
  }

  onConversationHistory(
    callback: (
      messages: {
        conversationId: string;
        senderId: string;
        text: string;
        sentAt: string;
      }[]
    ) => void
  ) {
    this.historyCallbacks.push(callback);
  }
}

export default new SignalRService();
