import Constants from "expo-constants";

export const getServerUrl = () => {
  const extra = Constants.expoConfig?.extra || Constants.manifest?.extra;

  if (!extra) {
    throw new Error("Config `extra` is not defined in `app.json` or `app.config.js`.");
  }

  const { NODE_ENV, LOCAL_SERVER_URL, REMOTE_SERVER_URL } = extra;

  return NODE_ENV === "development" ? LOCAL_SERVER_URL : REMOTE_SERVER_URL;
};
