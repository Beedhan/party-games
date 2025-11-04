import { normalWords } from "./wordlist";

export interface User {
  id: string;
  name?: string;
  isAdmin: boolean;
  isImposter: boolean;
}

export interface GameState {
  users: User[];
  started: boolean;
  word: string;
  logs: string[];
}

// export interface GameState extends BaseGameState {
//   // Add game-specific state properties here
// }

export const initialGameState = (): GameState => ({
  users: [],
  started: false,
  logs: [],
  word: "",
});

export const GameUpdater = (
  action: { type: string; payload: any },
  state: GameState
) => {
  switch (action.type) {
    case "ADD_USER":
      return addUser(state, action.payload);
    case "REMOVE_USER":
      return removeUser(state, action.payload);
    case "LOG_MESSAGE":
      return logMessage(state, action.payload);
    case "UPDATE_NAME":
      return updateUserName(state, action.payload.id, action.payload.name);
    case "NEW_ROUND":
      return createNewRound(state, action.payload.id);
    default:
      return state;
  }
};

export const GameInfo = (
  action: { type: string; payload: any },
  state: GameState
) => {
  switch (action.type) {
    case "GET_ADMIN":
      return getAdmin(state, action.payload.id);
  }
};

export function updateUserName(
  state: GameState,
  userId: string,
  name: string
): GameState {
  return {
    ...state,
    users: state.users.map((user) =>
      user.id === userId ? { ...user, name } : user
    ),
    logs: [...(state.logs || []), `User ${userId} updated name to ${name}.`],
  };
}

export function getAdmin(state: GameState, userId: string): User | null {
  const adminUser = state.users.find((u) => u.isAdmin);
  console.log(adminUser, userId, "ADMINNNNNN", adminUser?.id === userId);
  return adminUser || null;
}

export function addUser(state: GameState, user: User): GameState {
  console.log("Adding user:", state.users);
  if (state.users.length < 1) {
    user.isAdmin = true;
  } else {
    user.isAdmin = false;
  }
  return {
    ...state,
    users: [...state.users, user],
    logs: [...(state.logs || []), `User ${user.id} joined the game.`],
  };
}

export function removeUser(state: GameState, userId: string): GameState {
  const user = state.users.find((user) => user.id === userId);
  if (user?.isAdmin) {
    // If the removed user was an admin, assign a new admin
    const remainingUsers = state.users.filter((user) => user.id !== userId);
    if (remainingUsers.length > 0) {
      remainingUsers[0].isAdmin = true;
      return {
        ...state,
        users: remainingUsers,
        logs: [
          ...(state.logs || []),
          `User ${userId} left the game. User ${remainingUsers[0].id} is now admin.`,
        ],
      };
    }
  }
  return {
    ...state,
    users: state.users.filter((user) => user.id !== userId),
    logs: [...(state.logs || []), `User ${userId} left the game.`],
  };
}

export function logMessage(state: GameState, message: string): GameState {
  return {
    ...state,
    logs: [...(state.logs || []), message],
  };
}

export function createNewRound(state: GameState, userId: string): GameState {
  const user = state.users.find((user) => user.id === userId);
  if (!user?.isAdmin) return state;
  const makeImposter =
    state.users[Math.floor(Math.random() * state.users.length)];
  const updatedUsers = state.users.map((e) => {
    if (e.id === makeImposter.id) {
      return {
        ...e,
        isImposter: true,
      };
    }
    return {
      ...e,
      isImposter: false,
    };
  });
  return {
    ...state,
    users: updatedUsers,
    logs: [...(state.logs || []), "New round started"],
    started: true,
    word: normalWords[Math.floor(Math.random() * normalWords.length)],
  };
}
