import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  id: {
    translation: {
      welcome: {
        title: 'Passpot',
        subtitle: 'Pesan instan yang aman untuk semua orang',
        securityText: 'Enkripsi End-to-End',
        termsText:
          'Baca Kebijakan Privasi kami. Ketuk "Setuju & Lanjutkan" untuk menerima Ketentuan Layanan.',
        agreeButton: 'SETUJU & LANJUTKAN',
      },
      tabs: {
        chats: 'Chat',
        status: 'Status',
        news: 'Berita',
        profile: 'Profil',
        calls: 'Panggilan',
      },
      chatList: {
        searchPlaceholder: 'Cari chat...',
        noConversations: 'Belum ada percakapan',
        noConversationsSub: 'Mulai kirim pesan ke kontak Anda',
      },
      status: {
        title: 'Status',
        myStatus: 'Status Saya',
        addStatus: 'Ketuk untuk menambah status baru',
        recentUpdates: 'Pembaruan terkini',
        viewedUpdates: 'Pembaruan yang telah dilihat',
        me: 'Saya',
        typePlaceholder: 'Ketik status...',
      },
      news: {
        title: 'Berita',
        readMore: 'Baca Selengkapnya',
      },
      profile: {
        title: 'Profil',
        name: 'Agen Passpot',
        settingProfile: 'Profil',
        settingProfileSub: 'Privasi, keamanan, ganti nomor',
        settingPrivacy: 'Privasi',
        settingPrivacySub: 'Terakhir dilihat, foto profil, grup',
        settingSecurity: 'Keamanan',
        settingSecuritySub: 'Verifikasi dua langkah, enkripsi',
        settingNotifications: 'Notifikasi',
        settingNotificationsSub: 'Nada pesan, grup & panggilan',
        settingHelp: 'Bantuan',
        settingHelpSub: 'Pusat bantuan, hubungi kami, kebijakan privasi',
        logout: 'Keluar',
        logoutConfirmation: 'Apakah Anda yakin ingin keluar?',
        inviteByPin: 'Undang melalui ID Passpot',
        enterPinTitle: 'Masukkan ID Kontak',
        enterPinSubtitle: 'Masukkan ID kontak Anda',
        addContact: 'TAMBAH KONTAK',
      },
      privacy: {
        title: 'Privasi',
        sectionPersonalInfo: 'Siapa yang dapat melihat info pribadi saya',
        lastSeen: 'Terakhir Dilihat',
        profilePhoto: 'Foto Profil',
        about: 'Info',
        groups: 'Grup',
        sectionDisappearing: 'Pesan sementara',
        defaultTimer: 'Timer pesan default',
        defaultTimerDesc:
          'Mulai chat baru dengan pesan sementara yang disetel ke timer Anda',
        readReceipts: 'Laporan dibaca',
        readReceiptsDesc:
          'Jika dimatikan, Anda tidak akan mengirim atau menerima Laporan Dibaca. Laporan dibaca akan selalu dikirim untuk chat grup.',
        liveLocation: 'Lokasi Terkini',
        everyone: 'Semua Orang',
        myContacts: 'Kontak Saya',
        nobody: 'Tidak Ada',
        off: 'Mati',
      },
      notifications: {
        title: 'Notifikasi',
        sectionMessages: 'Pesan',
        convTones: 'Nada Percakapan',
        convTonesDesc: 'Putar suara untuk pesan masuk dan keluar',
        notificationTone: 'Nada Notifikasi',
        vibrate: 'Getar',
        reactionNotifications: 'Notifikasi Reaksi',
        reactionNotificationsDesc:
          'Tampilkan notifikasi untuk reaksi pada pesan yang Anda kirim',
        sectionGroups: 'Grup',
        groupNotifications: 'Notifikasi Grup',
        sectionCalls: 'Panggilan',
        ringtone: 'Nada Dering',
        default: 'Default',
      },
      help: {
        title: 'Bantuan',
        contactUs: 'Hubungi Kami',
        contactUsDesc: 'Pertanyaan? Butuh bantuan?',
        termsPrivacy: 'Ketentuan dan Kebijakan Privasi',
        appInfo: 'Info Aplikasi',
        version: 'Versi',
      },
      termsPrivacy: {
        title: 'Ketentuan & Privasi',
        content:
          'Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat Anda menggunakan aplikasi Passpot. Kami berkomitmen untuk memastikan bahwa privasi Anda terlindungi.\n\nSemua komunikasi di Passpot dilindungi oleh enkripsi end-to-end, yang berarti hanya Anda dan penerima pesan yang dapat membaca konten tersebut. Kami tidak menyimpan pesan Anda di server kami setelah pesan tersebut terkirim.\n\nInformasi yang kami kumpulkan hanyalah informasi dasar seperti alamat email Anda untuk keperluan verifikasi akun dan fitur keamanan tambahan seperti autentikasi dua faktor.\n\nKami tidak membagikan informasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran. Keamanan data Anda adalah prioritas utama kami, dan kami terus memperbarui protokol keamanan kami untuk menangkal ancaman terbaru.',
      },
      appInfo: {
        title: 'Info Aplikasi',
        desc: 'Passpot adalah aplikasi pesan instan yang fokus pada keamanan dan privasi pengguna dengan teknologi enkripsi end-to-end terkini.',
      },
      security: {
        title: 'Keamanan',
        protected: 'Akun Anda terlindungi',
        description:
          'Passpot menggunakan enkripsi end-to-end dan protokol keamanan standar industri untuk menjaga keamanan data Anda.',
        twoStep: 'Verifikasi Dua Langkah',
        authenticator: 'Google Authenticator',
        authenticatorDesc:
          'Gunakan Google Authenticator untuk lapisan keamanan tambahan saat masuk.',
        encryption: 'Enkripsi',
        encryptionDesc:
          'Pesan dan panggilan dalam chat terenkripsi end-to-end tetap berada di antara Anda dan orang yang Anda pilih. Bahkan Passpot tidak dapat membaca atau mendengarkannya.',
        learnMore: 'Pelajari selengkapnya',
        overlayTitle: 'Chat Terenkripsi',
        enterPinTitle: 'Masukkan PIN Keamanan',
        enterPinSubtitle: 'Masukkan 6 digit PIN keamanan numerik Anda',
        biometricSubtitle: 'Gunakan {{type}} atau PIN untuk melihat {{title}}',
        unlockWith: 'OPEN {{type}}',
        usePin: 'GUNAKAN PIN KEAMANAN',
        useBiometrics: 'GUNAKAN BIOMETRIK',
        cancel: 'BATAL',
        alertTitle: 'Peringatan Keamanan',
        tooManyAttempts:
          'Terlalu banyak percobaan yang gagal. Anda telah dikeluarkan demi keamanan.',
        incorrectPin: 'PIN Salah',
        attemptsRemaining: 'Anda memiliki {{count}} percobaan lagi.',
        tryAgain: 'Coba Lagi',
        contactAdmin:
          'Kesalahan verifikasi keamanan. Silakan hubungi admin Anda untuk bantuan.',
      },
      chat: {
        online: 'online',
        encryptedInfo:
          'Pesan dienkripsi secara end-to-end. Tidak ada orang di luar chat ini, bahkan Passpot, yang dapat membaca atau mendengarkannya.',
        secureSession: 'Sesi Aman',
        attachment: 'Lampiran',
        message: 'Pesan',
      },
      friendProfile: {
        about: 'Tentang',
        bio: 'Bio',
        sharedMedia: 'Media Bersama',
        noSharedMedia: 'Belum ada media yang dibagikan',
      },
      callLog: {
        title: 'Panggilan',
        yesterday: 'Kemarin',
        videoCall: 'Panggilan Video',
        voiceCall: 'Panggilan Suara',
        incoming: 'Masuk',
        outgoing: 'Keluar',
        unknownCaller: 'Penelepon Tidak Dikenal',
        noCallsTitle: 'Belum Ada Panggilan',
        noCallsSubtitle: 'Riwayat panggilan Anda akan muncul di sini',
      },
      editProfile: {
        title: 'Edit Profil',
        name: 'Nama',
        namePlaceholder: 'Masukkan nama Anda',
        nameHint:
          'Ini bukan nama pengguna atau pin Anda. Nama ini akan terlihat oleh kontak Passpot Anda.',
        about: 'Tentang',
        aboutPlaceholder: 'Tentang',
        phone: 'Telepon',
        save: 'Simpan',
        changePhoto: 'Ganti Foto',
      },
      loginEmail: {
        title: 'Masukkan email Anda',
        description:
          'Passpot akan mengirimkan kode verifikasi ke email Anda untuk memverifikasi akun Anda.',
        placeholder: 'Alamat Email',
        button: 'Lanjutkan',
        invalidEmail: 'Email Tidak Valid',
        invalidEmailDesc: 'Silakan masukkan alamat email yang valid.',
      },
      verifyOTP: {
        title: 'Verifikasi {{email}}',
        instruction:
          'Menunggu untuk mendeteksi kode verifikasi yang dikirim ke {{email}} secara otomatis.',
        wrongEmail: 'Salah email?',
        enterCode: 'Masukkan 6 digit kode',
        timer: 'Anda dapat meminta kode baru dalam {{time}}',
        resendLink: 'Kirim Ulang Email',
        button: 'Verifikasi',
        resend: 'Kirim ulang kode',
        error: 'Kesalahan',
        invalidCode: 'Kode tidak valid',
        invalidCodeDesc: 'Kode yang Anda masukkan salah. Silakan coba lagi.',
      },
      setup2FA: {
        title: 'Dua Langkah Verifikasi',
        titleOnboarding: 'Amankan Akun Anda',
        step1: 'Scan QR Code',
        step1Desc:
          'Scan kode QR ini dengan aplikasi Google Authenticator Anda untuk menautkan akun Passpot Anda.',
        scanText: 'SCAN DENGAN AUTHENTICATOR',
        step2: 'Masukkan Kode Rahasia Secara Manual',
        step2Desc:
          'Jika Anda tidak dapat men-scan kode QR, masukkan kode rahasia ini ke aplikasi autentikator Anda secara manual.',
        infoText:
          'Simpan kode ini dengan aman. Siapa pun yang memiliki akses ke kode ini dapat membuat kode 2FA Anda.',
        next: 'Berikutnya',
      },
      login2FA: {
        title: 'Verifikasi 2FA',
        header: 'Google Authenticator',
        instruction:
          'Masukkan 6 digit kode dari aplikasi Google Authenticator Anda.',
        verify: 'VERIFIKASI',
        invalidCode: 'Kode Tidak Valid',
        invalidCodeDesc: 'Kode 2FA yang Anda masukkan salah.',
      },
      verify2FA: {
        headerTitle: 'Verifikasi Penyiapan',
        title: 'Konfirmasi Kode 2FA',
        description:
          'Masukkan 6 digit kode yang saat ini ditampilkan di aplikasi Google Authenticator Anda untuk "Passpot".',
        secret: 'Rahasia',
        button: 'Lanjutkan',
        cancel: 'Batalkan Penyiapan',
        error: 'Kesalahan',
        errorDesc: 'Silakan masukkan 6 digit kode lengkap.',
        success: 'Berhasil',
        enabledOnboarding:
          'Verifikasi Dua Langkah kini diaktifkan. Selamat datang di Passpot!',
        enabledSecurity:
          'Verifikasi Dua Langkah kini diaktifkan. Anda perlu memasukkan kode dari Google Authenticator saat masuk dari perangkat baru.',
        startChatting: 'Mulai Chatting',
        great: 'Bagus',
        invalidCode: 'Kode Tidak Valid',
        invalidCodeDesc:
          'Kode yang Anda masukkan salah. Silakan coba lagi atau periksa aplikasi autentikator Anda.',
      },
      setupPin: {
        title: 'PIN Keamanan',
        setPin: 'Atur PIN Keamanan',
        description:
          'Buat PIN 6 digit sebagai cara alternatif untuk membuka pesan terenkripsi Anda jika biometrik tidak tersedia.',
        saveContinue: 'SIMPAN & LANJUTKAN',
        successTitle: 'PIN Berhasil Diatur',
        successDesc:
          'PIN keamanan 6 digit Anda telah disimpan. Anda dapat menggunakannya sebagai alternatif biometrik.',
      },
      common: {
        back: 'Kembali',
        error: 'Kesalahan',
        success: 'Berhasil',
        cancel: 'Batal',
        great: 'Bagus',
        startChatting: 'Mulai Chatting',
      },
    },
  },
  en: {
    translation: {
      welcome: {
        title: 'Passpot',
        subtitle: 'Secure messaging for everyone',
        securityText: 'End-to-End Encrypted',
        termsText:
          'Read our Privacy Policy. Tap "Agree & Continue" to accept the Terms of Service.',
        agreeButton: 'AGREE & CONTINUE',
      },
      tabs: {
        chats: 'Chats',
        status: 'Status',
        news: 'News',
        profile: 'Profile',
        calls: 'Calls',
      },
      chatList: {
        searchPlaceholder: 'Search chats...',
        noConversations: 'No conversations yet',
        noConversationsSub: 'Start messaging with your contacts',
      },
      status: {
        title: 'Status',
        myStatus: 'My Status',
        addStatus: 'Tap to add status update',
        recentUpdates: 'Recent updates',
        viewedUpdates: 'Viewed updates',
      },
      news: {
        title: 'News Feed',
        readMore: 'Read More',
      },
      profile: {
        title: 'Profile',
        name: 'Passpot Agent',
        settingProfile: 'Profile',
        settingProfileSub: 'Privacy, security, change number',
        settingPrivacy: 'Privacy',
        settingPrivacySub: 'Last seen, profile photo, groups',
        settingSecurity: 'Security',
        settingSecuritySub: 'Two-step verification, encryption',
        settingNotifications: 'Notifications',
        settingNotificationsSub: 'Message, group & call tones',
        settingHelp: 'Help',
        settingHelpSub: 'Help center, contact us, privacy policy',
        logout: 'Log Out',
        logoutConfirmation: 'Are you sure you want to log out?',
        inviteByPin: 'Invite by PIN',
        enterPinTitle: 'Enter Contact PIN',
        enterPinSubtitle: 'Enter the 6-digit alphanumeric PIN of your contact',
        addContact: 'ADD CONTACT',
      },
      privacy: {
        title: 'Privacy',
        sectionPersonalInfo: 'Who can see my personal info',
        lastSeen: 'Last Seen',
        profilePhoto: 'Profile Photo',
        about: 'About',
        groups: 'Groups',
        sectionDisappearing: 'Disappearing messages',
        defaultTimer: 'Default Message Timer',
        defaultTimerDesc:
          'Start new chats with disappearing messages set to your timer',
        readReceipts: 'Read Receipts',
        readReceiptsDesc:
          "If turned off, you won't send or receive Read Receipts. Read receipts are always sent for group chats.",
        liveLocation: 'Live Location',
        everyone: 'Everyone',
        myContacts: 'My Contacts',
        nobody: 'Nobody',
        off: 'Off',
      },
      notifications: {
        title: 'Notifications',
        sectionMessages: 'Messages',
        convTones: 'Conversation Tones',
        convTonesDesc: 'Play sounds for incoming and outgoing messages',
        notificationTone: 'Notification Tone',
        vibrate: 'Vibrate',
        reactionNotifications: 'Reaction Notifications',
        reactionNotificationsDesc:
          'Show notifications for reactions to messages you send',
        sectionGroups: 'Groups',
        groupNotifications: 'Group Notifications',
        sectionCalls: 'Calls',
        ringtone: 'Ringtone',
        default: 'Default',
      },
      help: {
        title: 'Help',
        contactUs: 'Contact Us',
        contactUsDesc: 'Questions? Need help?',
        termsPrivacy: 'Terms and Privacy Policy',
        appInfo: 'App Info',
        version: 'Version',
      },
      termsPrivacy: {
        title: 'Terms & Privacy',
        content:
          'This Privacy Policy explains how we collect, use, and protect your information when you use the Passpot app. We are committed to ensuring that your privacy is protected.\n\nAll communications on Passpot are protected by end-to-end encryption, meaning only you and the recipient of the message can read the content. We do not store your messages on our servers once they have been delivered.\n\nThe information we collect is only basic information such as your email address for account verification purposes and additional security features like two-factor authentication.\n\nWe do not share your personal information with third parties for marketing purposes. Your data security is our top priority, and we continuously update our security protocols to counter the latest threats.',
      },
      appInfo: {
        title: 'App Info',
        desc: 'Passpot is an instant messaging application focused on user security and privacy with the latest end-to-end encryption technology.',
      },
      security: {
        title: 'Security',
        protected: 'Your account is protected',
        description:
          'Passpot uses end-to-end encryption and industry-standard security protocols to keep your data safe.',
        twoStep: 'Two-Step Verification',
        authenticator: 'Google Authenticator',
        authenticatorDesc:
          'Use Google Authenticator for an extra layer of security when logging in.',
        encryption: 'Encryption',
        encryptionDesc:
          'Messages and calls in end-to-end encrypted chats stay between you and the people you choose. Not even Passpot can read or listen to them.',
        learnMore: 'Learn more',
        contactAdmin:
          'Security verification failed. Please contact your admin for assistance.',
      },
      editProfile: {
        title: 'Edit Profile',
        name: 'Name',
        namePlaceholder: 'Enter your name',
        nameHint:
          'This is not your username or pin. This name will be visible to your Passpot contacts.',
        about: 'About',
        aboutPlaceholder: 'About',
        phone: 'Phone',
        save: 'Save',
        changePhoto: 'Change Photo',
      },
      callLog: {
        title: 'Calls',
        yesterday: 'Yesterday',
        videoCall: 'Video Call',
        voiceCall: 'Voice Call',
        incoming: 'Incoming',
        outgoing: 'Outgoing',
        unknownCaller: 'Unknown Caller',
        noCallsTitle: 'No Calls Yet',
        noCallsSubtitle: 'Your call history will appear here',
      },
      loginEmail: {
        title: 'Enter your email',
        description:
          'Passpot will send a verification code to your email to verify your account.',
        placeholder: 'Email Address',
        button: 'Continue',
        invalidEmail: 'Invalid Email',
        invalidEmailDesc: 'Please enter a valid email address.',
      },
      verifyOTP: {
        title: 'Verify {{email}}',
        instruction:
          'Waiting to automatically detect a verification code sent to {{email}}.',
        wrongEmail: 'Wrong email?',
        enterCode: 'Enter 6-digit code',
        timer: 'You may request a new code in {{time}}',
        resendLink: 'Resend Email',
        button: 'Verify',
        resend: 'Resend code',
        error: 'Error',
        invalidCode: 'Invalid Code',
        invalidCodeDesc: 'The code you entered is incorrect. Please try again.',
      },
      setup2FA: {
        title: 'Two-Step Verification',
        titleOnboarding: 'Secure Your Account',
        step1: 'Scan QR Code',
        step1Desc:
          'Scan this QR code with your Google Authenticator app to link your Passpot account.',
        scanText: 'SCAN WITH AUTHENTICATOR',
        step2: 'Enter Secret Key Manually',
        step2Desc:
          "If you can't scan the QR code, enter this secret key into your authenticator app manually.",
        infoText:
          'Keep this key safe. Anyone with access to this key can generate your 2FA codes.',
        next: 'Next',
      },
      login2FA: {
        title: '2FA Verification',
        header: 'Google Authenticator',
        instruction:
          'Enter the 6-digit code from your Google Authenticator app.',
        verify: 'VERIFY',
        invalidCode: 'Invalid Code',
        invalidCodeDesc: 'The 2FA code you entered is incorrect.',
      },
      verify2FA: {
        headerTitle: 'Verify Setup',
        title: 'Confirm 2FA code',
        description:
          'Enter the 6-digit code currently shown in your Google Authenticator app for "Passpot".',
        secret: 'Secret',
        button: 'Continue',
        cancel: 'Cancel Setup',
        error: 'Error',
        errorDesc: 'Please enter the full 6-digit code.',
        success: 'Success',
        enabledOnboarding:
          'Two-Step Verification is now enabled. Welcome to Passpot!',
        enabledSecurity:
          'Two-Step Verification is now enabled. You will need to enter a code from Google Authenticator when logging in from a new device.',
        startChatting: 'Start Chatting',
        great: 'Great',
        invalidCode: 'Invalid Code',
        invalidCodeDesc:
          'The code you entered is incorrect. Please try again or check your authenticator app.',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'id', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
