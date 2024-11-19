# **ChatSphere**  
A real-time, feature-rich chat application built with **React Native** and **Firebase**. Connect with friends, share media, and experience secure, instant messaging on both iOS and Android!  

## **Features**  
- **Real-time Messaging**: Instant sync across devices using Firebase Firestore.  
- **User Authentication**: Secure login with email/password or social accounts (Google, Facebook).  
- **User Profiles**: Customize display names and profile pictures.  
- **Group Chats**: Create, manage, and participate in group conversations.  
- **Media Sharing**: Send and receive images, videos, and audio messages.  
- **Push Notifications**: Stay updated with Firebase Cloud Messaging.  
- **Message Status Indicators**: Know when your messages are delivered and read.  
- **Disappearing Messages**: Time-sensitive chats for added privacy.  
- **Voice & Video Calling**: Real-time communication powered by Agora/Twilio (optional).  

## **Tech Stack**  

### **Frontend**  
- **React Native**: Cross-platform mobile app development.
  
### **Backend**  
- **Firebase Firestore**: Real-time database for scalable messaging.  
- **Firebase Authentication**: Secure user authentication.  
- **Firebase Storage**: Media storage for images, videos, and files.  
- **Firebase Cloud Messaging**: Push notifications for message updates.  
- **Firebase Cloud Functions**: Server-side operations for triggers and validations.
   
### **Optional Add-ons**  
- **Agora/Twilio**: For voice and video calling.

### ** Folder Organization

``` bash
/ChatApp
├── /src
│   ├── /assets               # Static assets like images, fonts, etc.
│   │   ├── /images           # Images used in the app
│   │   ├── /icons            # Icons
│   │   └── /fonts            # Custom fonts
│   │
│   ├── /components           # Reusable UI components
│   │   ├── Button.js         # Custom button component
│   │   ├── InputField.js     # Custom input field component
│   │   ├── MessageBubble.js  # Message UI component
│   │   └── ...               # Other UI components
│   │
│   ├── /features             # Feature-specific modules
│   │   ├── /auth             # Authentication module
│   │   │   ├── AuthScreen.js
│   │   │   ├── authSlice.js  # Redux slice for auth
│   │   │   ├── authService.js
│   │   │   └── __tests__     # Test files for authentication feature
│   │   │       ├── authSlice.test.js
│   │   │       ├── AuthScreen.test.js
│   │   │       └── authService.test.js
│   │   ├── /chat             # Chat module
│   │   │   ├── ChatScreen.js
│   │   │   ├── chatSlice.js
│   │   │   ├── chatService.js
│   │   │   └── __tests__     # Test files for chat feature
│   │   │       ├── chatSlice.test.js
│   │   │       ├── ChatScreen.test.js
│   │   │       └── chatService.test.js
│   │   ├── /profile          # Profile management module
│   │   │   ├── ProfileScreen.js
│   │   │   ├── profileSlice.js
│   │   │   ├── profileService.js
│   │   │   └── __tests__     # Test files for profile feature
│   │   │       ├── profileSlice.test.js
│   │   │       ├── ProfileScreen.test.js
│   │   │       └── profileService.test.js
│   │   └── ...               # Other features (e.g., group chats, media sharing)
│   │
│   ├── /hooks                # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useChat.js
│   │   └── __tests__         # Test files for hooks
│   │       ├── useAuth.test.js
│   │       ├── useChat.test.js
│   │       └── ...
│   │
│   ├── /navigation           # Navigation setup
│   │   ├── AppNavigator.js   # Main navigation file
│   │   ├── AuthStack.js      # Auth flow
│   │   ├── ChatStack.js      # Chat flow
│   │   └── __tests__         # Test files for navigation
│   │       ├── AppNavigator.test.js
│   │       └── ...
│   │
│   ├── /services             # Firebase and third-party service integrations
│   │   ├── firebase.js       # Firebase configuration and initialization
│   │   ├── notifications.js  # Push notification service
│   │   └── __tests__         # Test files for services
│   │       ├── firebase.test.js
│   │       └── notifications.test.js
│   │
│   ├── /state                # Global state management
│   │   ├── store.js          # Redux store setup
│   │   ├── rootReducer.js    # Combine all slices
│   │   └── __tests__         # Test files for state management
│   │       ├── store.test.js
│   │       └── rootReducer.test.js
│   │
│   ├── /styles               # Shared styles
│   │   ├── colors.js         # Color palette
│   │   ├── typography.js     # Fonts and text styles
│   │   └── globalStyles.js   # General reusable styles
│   │
│   ├── /utils                # Utility functions
│   │   ├── dateUtils.js      # Date and time formatting
│   │   ├── validation.js     # Input validation
│   │   └── __tests__         # Test files for utilities
│   │       ├── dateUtils.test.js
│   │       └── validation.test.js
│   │
│   ├── App.js                # Main entry point
│   └── index.js              # React Native entry file
│
├── /tests                    # Global or integration tests
│   ├── App.test.js           # General app tests
│   ├── navigation.test.js    # Navigation tests
│   ├── firebase.test.js      # Firebase integration tests
│   └── ...
├── package.json              # NPM dependencies and scripts
└── README.md                 # Documentation
```

