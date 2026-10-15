# Role-Based Access Control (RBAC) Specification

HiveTalk implements hierarchical role-based permissions across groups. Roles are stored in `groups/{groupId}/members/{userId}.role`.

---

## 1. Roles Definition

| Role | Description |
| :--- | :--- |
| **Admin** | Group creator or promoted administrator with total management privileges. |
| **Moderator** | Elevated member authorized to maintain conversation quality and post announcements. |
| **Member** | Regular participant in group chats. |

---

## 2. Permissions Matrix

| Capability | Admin | Moderator | Member | Non-Member (Public Group) |
| :--- | :---: | :---: | :---: | :---: |
| **View Group Information** | ✅ | ✅ | ✅ | ✅ |
| **Read Messages** | ✅ | ✅ | ✅ | ❌ |
| **Send Messages** | ✅ | ✅ | ✅ | ❌ |
| **Edit Own Messages** | ✅ | ✅ | ✅ | ❌ |
| **Delete Own Messages** | ✅ | ✅ | ✅ | ❌ |
| **Delete Any Member's Message** | ✅ | ✅ | ❌ | ❌ |
| **Add / Remove Emoji Reactions** | ✅ | ✅ | ✅ | ❌ |
| **Pin / Unpin Messages** | ✅ | ✅ | ❌ | ❌ |
| **Create Announcements** | ✅ | ✅ | ❌ | ❌ |
| **Comment on Announcements** | ✅ | ✅ | ✅ | ❌ |
| **Generate Group Invites** | ✅ | ✅ | ✅ | ❌ |
| **Revoke / Invalidate Invites** | ✅ | ✅ | ❌ | ❌ |
| **Promote / Demote Members** | ✅ | ❌ | ❌ | ❌ |
| **Kick Members** | ✅ | ❌ | ❌ | ❌ |
| **Update Group Name / Avatar / Desc** | ✅ | ✅ | ❌ | ❌ |
| **Delete Group** | ✅ | ❌ | ❌ | ❌ |
| **Initiate Voice / Video Call** | ✅ | ✅ | ✅ | ❌ |

---

## 3. Enforcement Layers

1. **API Middleware**: Validated via `server/src/middleware/moderatorMiddleware.ts` and `permissions.ts`.
2. **Firestore Security Rules**: Validated declaratively in `firebase/firestore.rules` using `isAdmin(groupId)` and `isModerator(groupId)` functions.
3. **Client UI Controls**: Components conditionally render management buttons using the `usePermissions` React hook.
