import { AuthBindings } from "@refinedev/core";
import { Amplify, Auth } from "aws-amplify";
import type { AuthActionResponse } from "@refinedev/core/dist/interfaces";
import { env } from "./env";

Amplify.configure({
  Auth: {
    // fixme: set your own ids.
    userPoolId: "eu-west-1_BwBmZiu5l",
    userPoolWebClientId: env.VITE_USERPOOL_WEB_CLIENT_ID,
  },
});

interface CognitoUser {
  username: string;
  attributes: {
    name: string;
    picture?: string;
    email: string;
    // fixme: put your own permission attribute here if you have one.
    // "custom:permissions"?: string;
  };
}

const getErrorResponse = (error: unknown): AuthActionResponse => {
  if (error instanceof Error) {
    return {
      success: false,
      error: error,
    };
  }
  if (typeof error === "string") {
    return {
      success: false,
      error: new Error(error),
    };
  } else {
    return {
      success: false,
      error: new Error("Unknown error"),
    };
  }
};

const authProvider: AuthBindings = {
  login: async (input) => {
    const { email, password } = input;
    try {
      const user = await Auth.signIn(email, password);
      console.info("login success", user);
      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      return getErrorResponse(error);
    }
  },
  logout: async () => {
    try {
      await Auth.signOut();
      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (error) {
      return getErrorResponse(error);
    }
  },
  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      return {
        logout: true,
        redirectTo: "/login",
        error: new Error("Unauthorized"),
      };
    }
    return {};
  },
  check: async () => {
    try {
      await Auth.currentSession();
      return {
        authenticated: true,
      };
    } catch (error) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }
  },
  getPermissions: async () => {
    try {
      const user = (await Auth.currentAuthenticatedUser()) as unknown as CognitoUser;
      // fixme: implement your own logic
      // const permissions = (user.attributes["custom:permissions"] ?? "").split(",");
      // return permissions;
      return [];
    } catch (error) {
      return [];
    }
  },
  getIdentity: async () => {
    try {
      const user = (await Auth.currentAuthenticatedUser()) as unknown as CognitoUser;
      return {
        id: user.username,
        fullName: user.attributes.name,
        avatar: user.attributes.picture,
      };
    } catch (error) {
      return null;
    }
  },
  forgotPassword: async (input) => {
    try {
      await Auth.forgotPassword(input.email);
      return {
        success: true,
        redirectTo: "/update-password",
      };
    } catch (error) {
      return getErrorResponse(error);
    }
  },
  /**
   * You will need to swizzle AuthPage, and edit inputs of UpdatePasswordPage with:
   * type UpdatePasswordFormTypes = {
   *   email?: string;
   *   code?: string;
   *   password?: string;
   * };
   */
  updatePassword: async (input) => {
    try {
      await Auth.forgotPasswordSubmit(input.email, input.code, input.password);
      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (error) {
      return getErrorResponse(error);
    }
  },
};

export { authProvider };





// import { AuthProvider } from "@refinedev/core";

// import { User } from "@/graphql/schema.types";

// import { API_URL, dataProvider } from "./data";

// /**
//  * For demo purposes and to make it easier to test the app, you can use the following credentials:
//  */
// export const authCredentials = {
//   email: "michael.scott@dundermifflin.com",
//   password: "demodemo",
// };

// export const authProvider: AuthProvider = {
//   login: async ({ email }) => {
//     try {
//       const { data } = await dataProvider.custom({
//         url: API_URL,
//         method: "post",
//         headers: {},
//         meta: {
//           variables: { email },
//           rawQuery: `
//                 mutation Login($email: String!) {
//                     login(loginInput: {
//                       email: $email
//                     }) {
//                       accessToken,
//                     }
//                   }
//                 `,
//         },
//       });

//       localStorage.setItem("access_token", data.login.accessToken);

//       return {
//         success: true,
//         redirectTo: "/",
//       };
//     } catch (e) {
//       const error = e as Error;

//       return {
//         success: false,
//         error: {
//           message: "message" in error ? error.message : "Login failed",
//           name: "name" in error ? error.name : "Invalid email or password",
//         },
//       };
//     }
//   },
//   logout: async () => {
//     localStorage.removeItem("access_token");

//     return {
//       success: true,
//       redirectTo: "/login",
//     };
//   },
//   onError: async (error) => {
//     if (error.statusCode === "UNAUTHENTICATED") {
//       return {
//         logout: true,
//       };
//     }

//     return { error };
//   },
//   check: async () => {
//     try {
//       await dataProvider.custom({
//         url: API_URL,
//         method: "post",
//         headers: {},
//         meta: {
//           rawQuery: `
//                     query Me {
//                         me {
//                           name
//                         }
//                       }
//                 `,
//         },
//       });

//       return {
//         authenticated: true,
//         redirectTo: "/",
//       };
//     } catch (error) {
//       return {
//         authenticated: false,
//         redirectTo: "/login",
//       };
//     }
//   },
//   getIdentity: async () => {
//     const accessToken = localStorage.getItem("access_token");

//     try {
//       const { data } = await dataProvider.custom<{ me: User }>({
//         url: API_URL,
//         method: "post",
//         headers: accessToken
//           ? {
//               Authorization: `Bearer ${accessToken}`,
//             }
//           : {},
//         meta: {
//           rawQuery: `
//                     query Me {
//                         me {
//                             id,
//                             name,
//                             email,
//                             phone,
//                             jobTitle,
//                             timezone
//                             avatarUrl
//                         }
//                       }
//                 `,
//         },
//       });

//       return data.me;
//     } catch (error) {
//       return undefined;
//     }
//   },
// };
