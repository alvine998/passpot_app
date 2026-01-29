export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  imageUrl: string;
}

export interface Contact {
  id: string;
  name: string;
  status: string;
  avatar: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  MainTabs: undefined;
  Chats: undefined;
  ChatRoom: {
    id?: string;
    recipientCode?: string;
    name: string;
    avatar?: string | null;
  };
  ContactList:
    | { forwardMessage?: { messageId: string; text: string; image?: string } }
    | undefined;
  Status: undefined;
  News: undefined;
  NewsDetail: { newsItem: NewsItem };
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  Security: undefined;
  Setup2FA: { isOnboarding?: boolean; email?: string };
  Verify2FA: { secret: string; isOnboarding?: boolean; email?: string };
  LoginEmail: undefined;
  VerifyOTP: { email: string };
  Login2FA: undefined;
  Privacy: undefined;
  Notifications: undefined;
  Help: undefined;
  TermsPrivacy: undefined;
  AppInfo: undefined;
  VoiceCall: { userId: string; userName: string; isIncoming?: boolean };
  VideoCall: { userId: string; userName: string; isIncoming?: boolean };
  SetupPIN: { isOnboarding: boolean; email?: string };
  VerifyPIN: { email?: string };
  Logout: undefined;
  FriendProfile: {
    id: string;
    name: string;
    userCode?: string;
    avatar?: string | null;
  };
};
