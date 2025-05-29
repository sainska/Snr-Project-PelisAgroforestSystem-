
import { toast } from "@/hooks/use-toast";

export class SessionTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private warningTimeoutId: NodeJS.Timeout | null = null;
  private isWarningShown = false;
  private onLogout: () => void;
  private timeoutDuration: number;
  private warningDuration: number;

  constructor(
    onLogout: () => void,
    timeoutMinutes: number = 30,
    warningMinutes: number = 5
  ) {
    this.onLogout = onLogout;
    this.timeoutDuration = timeoutMinutes * 60 * 1000; // Convert to milliseconds
    this.warningDuration = warningMinutes * 60 * 1000; // Convert to milliseconds
  }

  start() {
    this.reset();
    this.setupEventListeners();
  }

  stop() {
    this.clearTimeouts();
    this.removeEventListeners();
  }

  reset() {
    this.clearTimeouts();
    this.isWarningShown = false;

    // Set warning timeout (5 minutes before logout)
    this.warningTimeoutId = setTimeout(() => {
      this.showWarning();
    }, this.timeoutDuration - this.warningDuration);

    // Set logout timeout
    this.timeoutId = setTimeout(() => {
      this.logout();
    }, this.timeoutDuration);
  }

  private clearTimeouts() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  private showWarning() {
    if (!this.isWarningShown) {
      this.isWarningShown = true;
      toast({
        title: "Session Expiring Soon",
        description: "Your session will expire in 5 minutes due to inactivity. Click anywhere to stay logged in.",
        duration: 10000,
      });
    }
  }

  private logout() {
    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });
    this.onLogout();
  }

  private setupEventListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, this.handleUserActivity, true);
    });
  }

  private removeEventListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.handleUserActivity, true);
    });
  }

  private handleUserActivity = () => {
    this.reset();
  };
}