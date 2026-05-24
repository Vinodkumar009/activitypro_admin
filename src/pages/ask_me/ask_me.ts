import { Component, ViewChild } from '@angular/core';
import { IonicPage, Content } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { CommonRestApiDtoV1 } from '../../shared/model/common.model';
import { HttpService } from '../../services/http.service';
import { SharedServices } from '../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../services/common.service';
import { API } from '../../shared/constants/api_constants';
import { AppType, ModuleTypes } from '../../shared/constants/module.constants';
import { markdown } from 'markdown';

enum FeedbackType {
  LIKE = 'like',
  DISLIKE = 'dislike'
}

enum FeedbackSeverity {
  GOOD = 'good',
  POOR = 'poor'
}

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
  interactionId?: string;
  isError?: boolean;
  formattedText?: string;
  feedbackGiven?: 'like' | 'dislike' | null;
}

@IonicPage()
@Component({
  selector: 'page-ask_me',
  templateUrl: 'ask_me.html',
  providers: [HttpService]
})
export class AskMePage {
  @ViewChild(Content) content: Content;
  isDarkTheme: boolean = true;
  userInput: string = '';
  prompts: AgentcoreResponse[] = [];
  showFeedbackModal: boolean = false;
  feedbackType: string = '';
  feedbackComment: string = '';
  selectedInteractionId: string = '';
  isThinking: boolean = false;

  messages: ChatMessage[] = [
    {
      text: `Hi! Welcome to ActivityPro. I'm here to help you.`,
      isUser: false,
      timestamp: this._getFormattedTimestamp()
    }
  ];

  constructor(
    private storage: Storage, 
    private events: Events,
    private httpService: HttpService,
    private sharedservice: SharedServices,
    private commonService: CommonService
  ) {}

  ionViewDidLoad() {
    this.loadTheme();
    this.getPrompts();
  }

  getPrompts() {
    const input = new AgentcoreInput();
    input.module = ModuleTypes.GENERIC
    input.intent = 1;
    input.parentclub_id = this.sharedservice.getPostgreParentClubId();
    input.action_type = 1;
    input.app_type = AppType.ADMIN_NEW;
    input.device_id = this.sharedservice.getDeviceId() ||'unknown';
    input.device_type = this.sharedservice.getPlatform() === 'android' ? 1 : 2;
    input.updated_by = this.sharedservice.getLoggedInUserId() || 'superadmin';

    this.httpService.post<AgentcoreResponse[]>(`${API.AGENT_CHAT_PROMPTS}`, input)
      .subscribe({
        next: (res) => {
          this.prompts = res;
        },
        error: (err) => {
          console.error('Error fetching prompts:', err);
          this.commonService.toastMessage('Failed to load prompts', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      });
  }

  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      if (isDarkTheme !== null) {
        this.isDarkTheme = isDarkTheme;
      } else {
        this.isDarkTheme = true;
      }
      this.applyTheme();
    }).catch(() => {
      this.isDarkTheme = true;
      this.applyTheme();
    });
    
    this.events.subscribe('theme:changed', (isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme();
    });
  }

  applyTheme() {
    const pageElement = document.querySelector('page-ask_me');
    if (pageElement) {
      if (this.isDarkTheme) {
        pageElement.classList.remove('light-theme');
      } else {
        pageElement.classList.add('light-theme');
      }
    }
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
    this.storage.remove('agent_session_id');
  }

  // 🕒 Format timestamp as "30 Apr, 4:31pm"
  private _getFormattedTimestamp(): string {
    const now = new Date();
    const day = now.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[now.getMonth()];
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${day} ${month}, ${hours}:${minutesStr}${ampm}`;
  }

  sendMessage(): void {
    if (this.userInput.trim()) {
      const userMsg = this.userInput;
      this.messages.push({
        text: userMsg,
        isUser: true,
        timestamp: this._getFormattedTimestamp()
      });
      this.userInput = '';
      this.sendPromptToAgent(userMsg);
      this.scrollToBottom();
    }
  }

  selectPrompt(prompt: string): void {
    this.messages.push({
      text: prompt,
      isUser: true,
      timestamp: this._getFormattedTimestamp()
    });
    this.sendPromptToAgent(prompt);
    this.scrollToBottom();
  }

  async sendPromptToAgent(prompt: string): Promise<void> {
    const sessionId = await this.storage.get('agent_session_id') || '';
    
    const input: AgentInvokeInput = {
      parentclub_id: this.sharedservice.getPostgreParentClubId(),
      club_id: '',
      member_id: this.sharedservice.getLoggedInId(),
      prompt: prompt,
      locale: 'UK',
      limit: 10,
      module: ModuleTypes.TERMSESSION,
      apptype: AppType.ADMIN_NEW,
      session_id: sessionId,
      start_date: '',
      end_date: ''
    };

    this.isThinking = true;
    this.httpService.post<AgentInvokeResponse>(`${API.AGENT_CHAT_INVOKE}`, input, null, 4)
      .subscribe({
        next: (res) => {
          this.isThinking = false;
          const responseData = JSON.parse(res.response);
          const content = responseData.result.content[0].text;
          this.messages.push({
            text: content,
            isUser: false,
            timestamp: this._getFormattedTimestamp(),
            interactionId: res.interaction_id,
            formattedText: markdown.toHTML(content)
          });
          if (res.sessionId) {
            this.storage.set('agent_session_id', res.sessionId);
          }
          this.scrollToBottom();
        },
        error: (err) => {
          this.isThinking = false;
          console.error('Error invoking agent:', err);
          this.messages.push({
            text: 'Sorry, I encountered an error processing your request.',
            isUser: false,
            timestamp: this._getFormattedTimestamp(),
            isError: true
          });
          this.scrollToBottom();
        }
      });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(300);
      }
    }, 100);
  }

  getPromptIcon(index: number): string {
    return 'bulb';
  }

  removeFeedback(interactionId: string): void {
    const input: RemoveFeedbackInput = {
      parentclubId: this.sharedservice.getPostgreParentClubId(),
      clubId: '',
      activityId: '',
      memberId: this.sharedservice.getLoggedInUserId(),
      action_type: 1,
      device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || 'unknown',
      updated_by: this.sharedservice.getLoggedInUserId() || 'superadmin',
      interaction_id: interactionId
    };

    this.httpService.post(`${API.AGENT_CHAT_REMOVE_FEEDBACK}`, input)
      .subscribe({
        next: () => {
          const message = this.messages.find(m => m.interactionId === interactionId);
          if (message) {
            message.feedbackGiven = null;
          }
          this.commonService.toastMessage('Feedback removed', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        },
        error: (err) => {
          console.error('Error removing feedback:', err);
          this.commonService.toastMessage('Failed to remove feedback', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      });
  }

  copyMessage(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.commonService.toastMessage('Copied to clipboard', 2000, ToastMessageType.Success, ToastPlacement.Bottom);
  }

  openFeedbackModal(type: FeedbackType, interactionId: string): void {
    const message = this.messages.find(m => m.interactionId === interactionId);
    if (message && message.feedbackGiven === type) {
      this.removeFeedback(interactionId);
      return;
    }
    this.feedbackType = type;
    this.selectedInteractionId = interactionId;
    this.feedbackComment = '';
    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.feedbackComment = '';
  }

  submitFeedback(): void {
    const input: FeedbackInput = {
      parentclubId: this.sharedservice.getPostgreParentClubId(),
      clubId: '',
      activityId: '',
      memberId: this.sharedservice.getLoggedInId(),
      action_type: 1,
      device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId() || 'unknown',
      updated_by: this.sharedservice.getLoggedInUserId() || 'superadmin',
      interaction_id: this.selectedInteractionId,
      user_id: this.sharedservice.getLoggedInUserId(),
      feedback_type: this.feedbackType,
      comments: this.feedbackComment,
      feedback_categories: null,
      severity: this.feedbackType === FeedbackType.LIKE ? FeedbackSeverity.GOOD : FeedbackSeverity.POOR
    };

    this.httpService.post(`${API.AGENT_CHAT_FEEDBACK}`, input)
      .subscribe({
        next: () => {
          const message = this.messages.find(m => m.interactionId === this.selectedInteractionId);
          if (message) {
            message.feedbackGiven = this.feedbackType as 'like' | 'dislike';
          }
          this.commonService.toastMessage('Feedback submitted successfully', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.closeFeedbackModal();
        },
        error: (err) => {
          console.error('Error submitting feedback:', err);
          this.commonService.toastMessage('Failed to submit feedback', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      });
  }
}

export class AgentcoreInput extends CommonRestApiDtoV1 {
  module: number;
  intent: number;
}

export class AgentcoreResponse {
  id: any;
  created_at: string;
  created_by: string;
  updated_at: string;
  deleted_at: any;
  updated_by: string;
  is_active: boolean;
  prompt: string;
  module: number;
  intent: number;
}

export interface AgentInvokeInput {
  parentclub_id: string;
  club_id: string;
  member_id: string;
  prompt: string;
  locale: string;
  limit: number;
  module: number;
  apptype: number;
  session_id: string;
  start_date: string;
  end_date: string;
}

export interface AgentInvokeResponse {
  response: string;
  sessionId: string;
  interaction_id: string;
}

export interface FeedbackInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  interaction_id: string;
  user_id: string;
  feedback_type: string;
  comments: string;
  feedback_categories: any;
  severity: string;
}

export interface RemoveFeedbackInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  interaction_id: string;
}