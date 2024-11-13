# auth-ready-express-middleware
## Almost production-ready middleware for scalable low-dependency authentication and session management
### Just add your own storage mechanisms

This document outlines the user stories for implementing authentication middleware in an ExpressJS application. The focus is on session-based authentication without using JSON Web Tokens (JWT). We are using typescript language for our source code. You can implement your own getUser/setUser functions and DB queries. Third party authenticators are excluded so they can't tamper with your sessions.

- An authenticator can either be a master or an authorized slave.
- Authorized slaves can validate tokens/sessions. If a user is authenticated they exchange and recreate the session with existing parameters. An API-key, user-key and maybe ip-tables are used in addition to sessionids in order to load-balance effectively.
- Sometimes registrations are only allowed if admin approves them.
- Sometimes users can sign in using an API-Key

## User Stories



### 7. Automatic Session ID Updates
- **As a** logged-in user
- **I want** my session ID to be updated automatically
- **So that** my session remains secure
- **Estimated Time:** 4 hours

### 8. IP Verification
- **As a** system administrator
- **I want** to verify user IP addresses during login
- **So that** I can enhance security by detecting suspicious logins
- **Estimated Time:** 5 hours

### 9. Rate Limiting
- **As a** system administrator
- **I want** to implement rate limiting
- **So that** I can prevent abuse and ensure fair usage of the system
- **Estimated Time:** 5 hours

### 1. User Registration
- **As a** new user
- **I want** to register an account
- **So that** I can access the application
- **Estimated Time:** 4 hours

### 2. User Login with Sessions
- **As a** registered user
- **I want** to log in with a session of variable length
- **So that** I can stay logged in for a customizable duration
- **Estimated Time:** 5 hours

### 3. Brute Force Protection
- **As a** system administrator
- **I want** to implement brute force protection
- **So that** the system can prevent unauthorized access attempts
- **Estimated Time:** 6 hours

### 4. Email Multi-Factor Authentication (MFA)
- **As a** registered user
- **I want** to use email MFA during login
- **So that** my account is more secure
- **Estimated Time:** 8 hours

### 5. Password Reset
- **As a** registered user
- **I want** to reset my password if I forget it
- **So that** I can regain access to my account
- **Estimated Time:** 4 hours

### 6. Automatic Secure Password Generation
- **As a** new user
- **I want** the system to generate a secure password for me
- **So that** I can have a strong password without creating one myself
- **Estimated Time:** 3 hours

### 10. Instead of CAPTCHA use email verification in Registration
- **As a** new user
- **I want** to complete a Google RECAPTCHA during registration
- **So that** the system can verify that I am not a bot
- **Estimated Time:** 3 hours

### 11. Device Authentication
- **As a** registered user
- **I want** to optionally authenticate my device
- **So that** I can enhance the security of my account
- **Estimated Time:** 6 hours

### 12. Store Users in Memory
- **As a** system administrator
- **I want** to store user data in memory or override functions at initialization
- **So that** I can manage user data efficiently and securely
- **Estimated Time:** 7 hours

### 13. Default HTML Pages
- **As a** new user
- **I want** the application to include default HTML pages for login, registration, and password reset
- **So that** I can have a user-friendly interface for these actions
- **Estimated Time:** 5 hours

### 13. Behavior Logging
- **As a** system administrator
- **I want** to receive messages when suspicious activity occurs
- **So that** I can capture hackers before something goes wrong
- **Estimated Time:** 5 hours


## Total Estimated Time: 65 hours