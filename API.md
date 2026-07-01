# API Documentation

## Friend Request API

All endpoints require a valid JWT token in the `Authorization` header: `Bearer <token>`.

### 1. Send Friend Request
Sends a friend request to another user.

- **Endpoint:** `POST /api/send-friend-request`
- **Request Body:**
  ```json
  {
    "receiverUsername": "targetUser"
  }
  ```
- **Responses:**
  - `200 OK`: Friend request sent successfully.
  - `400 Bad Request`: Invalid request (e.g., self-request).
  - `401 Unauthorized`: Invalid or missing token.

### 2. Get Pending Friend Requests
Retrieves all pending friend requests for the authenticated user.

- **Endpoint:** `GET /api/get-friend-requests`
- **Responses:**
  - `200 OK`: Returns an array of pending requests.
    ```json
    [
      { "id": "uuid", "sender_username": "senderUser" }
    ]
    ```
  - `401 Unauthorized`: Invalid or missing token.

### 3. Accept Friend Request
Accepts a pending friend request by its ID.

- **Endpoint:** `POST /api/accept-friend-request`
- **Request Body:**
  ```json
  {
    "requestId": "uuid"
  }
  ```
- **Responses:**
  - `200 OK`: Friend request accepted successfully.
  - `400 Bad Request`: Error updating request.
  - `401 Unauthorized`: Invalid or missing token.
