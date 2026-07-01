# API Documentation

## Friend Management API

All friend-related functionality is now consolidated into a single endpoint.

### Unified Friends Endpoint
- **Endpoint:** `POST /api/friends`
- **Authentication:** Valid JWT token in `Authorization` header: `Bearer <token>`.
- **Request Format:**
  ```json
  {
    "action": "<action_name>",
    "...": "additional_parameters"
  }
  ```

### Supported Actions

#### 1. Search Players
- **Action:** `search-players`
- **Params:** `username` (partial string)
- **Description:** Returns a list of users matching the input string (case-insensitive).

#### 2. Send Friend Request
- **Action:** `send-request`
- **Params:** `receiverUsername` (string)
- **Description:** Sends a friend request to the target user.

#### 3. Get Pending Friend Requests
- **Action:** `get-requests`
- **Description:** Returns a list of pending friend requests for the authenticated user.

#### 4. Accept Friend Request
- **Action:** `accept-request`
- **Params:** `requestId` (uuid)
- **Description:** Accepts a friend request and establishes a friendship.

#### 5. Get Friend List
- **Action:** `get-friends` (Can also use `GET /api/friends`)
- **Description:** Returns an array of the authenticated user's friends.

#### 6. Remove Friend
- **Action:** `remove-friend`
- **Params:** `friendUsername` (string)
- **Description:** Removes a user from the friend list.
