import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private studentId: number | null = null;

  connect(studentId?: number) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
      
      if (studentId) {
        this.studentId = studentId;
        this.socket?.emit('join_student_room', studentId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
    });

    return this.socket;
  }

  joinStudentRoom(studentId: number) {
    if (this.socket?.connected) {
      this.studentId = studentId;
      this.socket.emit('join_student_room', studentId);
    }
  }

  joinAdminRoom() {
    if (this.socket?.connected) {
      this.socket.emit('join_admin_room');
    }
  }

  onApplicationUpdate(callback: (data: any) => void) {
    this.socket?.on('application_update', callback);
  }

  onComplaintUpdate(callback: (data: any) => void) {
    this.socket?.on('complaint_update', callback);
  }

  onPaymentUpdate(callback: (data: any) => void) {
    this.socket?.on('payment_update', callback);
  }

  onNewApplication(callback: (data: any) => void) {
    this.socket?.on('new_application', callback);
  }

  onNewComplaint(callback: (data: any) => void) {
    this.socket?.on('new_complaint', callback);
  }

  onNewPayment(callback: (data: any) => void) {
    this.socket?.on('new_payment', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.studentId = null;
    }
  }
}

export const socketManager = new SocketManager();