# Authentication Service API - README

This project provides an authentication service API for managing user accounts and authentication-related functionality. It includes endpoints for user registration, login, password change, password reset, account deletion, and email verification.

## Features

-   **User Registration**: Register new users with their full name, email, and password.
-   **Login**: Authenticate users with email and password, returning access and refresh tokens.
-   **Password Management**: Change the user password and reset forgotten passwords.
-   **Email Verification**: Verify email addresses using OTP.
-   **Account Deletion**: Permanently delete a user's account after confirming the user's password.
-   **Session Management**: Authenticate users using cookies for token-based authentication (JWT).

## Endpoints

### 1. POST /api/auth/register

-   **Description**: Register a new user.
-   **Request Body**:
    ```json
    {
    	"full_name": "John Doe",
    	"email": "johndoe@example.com",
    	"password": "password123"
    }
    ```
-   **Response**:
    -   Success: 201 - User created and OTP sent.
    -   Error: 400 - Bad Request (e.g., user already exists).

---

### 2. POST /api/auth/login

-   **Description**: Log in with email and password.
-   **Request Body**:
    ```json
    {
    	"email": "johndoe@example.com",
    	"password": "password123"
    }
    ```
-   **Response**:
    -   Success: 200 - Access and refresh tokens returned in cookies.
    -   Error: 401 - Unauthorized (Invalid credentials).

---

### 3. POST /api/auth/change-password

-   **Description**: Change the user's password.
-   **Cookies**: access_token
-   **Request Body**:
    ```json
    {
    	"oldPassword": "password123",
    	"newPassword": "newpassword123"
    }
    ```
-   **Response**:
    -   Success: 200 - Password updated.
    -   Error: 401 - Unauthorized (Invalid old password).

---

### 4. POST /api/auth/verify

-   **Description**: Verify the user’s email using an OTP.
-   **Cookies**: access_token
-   **Request Body**:
    ```json
    {
    	"email": "johndoe@example.com",
    	"code": 123456
    }
    ```
-   **Response**:
    -   Success: 200 - Email verified.
    -   Error: 401 - Unauthorized (Invalid OTP).

---

### 5. POST /api/auth/resend-code

-   **Description**: Resend the email verification code to the user.
-   **Cookies**: access_token
-   **Request Body**:
    ```json
    {
    	"email": "johndoe@example.com"
    }
    ```
-   **Response**:
    -   Success: 200 - Verification code resent.
    -   Error: 400 - Bad Request (User not found).

---

### 6. POST /api/auth/init-reset-password

-   **Description**: Initialize the password reset process.
-   **Request Body**:
    ```json
    {
    	"email": "johndoe@example.com"
    }
    ```
-   **Response**:
    -   Success: 200 - Password reset email sent.
    -   Error: 404 - Not Found (User not found).

---

### 7. POST /api/auth/forget-password

-   **Description**: Reset the user’s password.
-   **Request Body**:
    ```json
    {
    	"email": "johndoe@example.com",
    	"newPassword": "newpassword123",
    	"code": "123456"
    }
    ```
-   **Response**:
    -   Success: 200 - Password reset successfully.
    -   Error: 400 - Bad Request (Invalid OTP).

---

### 8. POST /api/auth/logout

-   **Description**: Log out the user by invalidating the current session.
-   **Cookies**: access_token
-   **Response**:
    -   Success: 200 - User logged out.
    -   Error: 401 - Unauthorized (Invalid token).

---

### 9. DELETE /api/auth/delete-account

-   **Description**: Delete the user’s account permanently.
-   **Cookies**: access_token
-   **Request Body**:
    ```json
    {
    	"password": "password123"
    }
    ```
-   **Response**:
    -   Success: 200 - Account deleted.
    -   Error: 401 - Unauthorized (Invalid password).

## JWT Authentication

The API uses JSON Web Tokens (JWT) for authentication. After a successful login, the user will receive both an access token and a refresh token, which are stored in cookies. The access token is used for authenticating requests, while the refresh token can be used to obtain a new access token when the original one expires.

## Environment Variables

Ensure you have the following environment variables configured in your .env file:

-   `ACCESS_TOKEN_SECRET` – Secret key for signing access tokens.
-   `REFRESH_TOKEN_SECRET` – Secret key for signing refresh tokens.
-   `ACCESS_TOKEN_EXPIRATION` – Expiration time for access tokens (e.g., 1h).
-   `REFRESH_TOKEN_EXPIRATION` – Expiration time for refresh tokens (e.g., 7d).
-   `OTP_EXPIRATION` – Expiration time for OTP codes in minutes.
-   `SMTP_HOST` – SMTP host for sending emails.
-   `SMTP_PORT` – SMTP port for sending emails.
-   `SMTP_USER` – SMTP user for email authentication.
-   `SMTP_PASS` – SMTP password for email authentication.

## Technologies

-   Node.js
-   Express.js for API routing.
-   MongoDB for database storage.
-   JWT for authentication.
-   Argon2 for password hashing.
-   Nodemailer for email sending (used for verification and password reset emails).
-   Joi for request validation.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github_url
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables in a `.env` file.

4. Run the build command:
    ```bash
    npm run build
    ```
5. Start the server:

    ```bash
    npm start
    ```

The server will start running at `http://localhost:8000`.
