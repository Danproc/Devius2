import { helloWorld } from "./hello-world";
import { expireCredits } from "./expire-credits";
import { syncGitHubData } from "./sync-github-data";
import { dailyGitHubSync } from "./daily-github-sync";
import { aggregateAnalytics } from "./aggregate-analytics";
import { cleanupAnalytics } from "./cleanup-analytics";
// Premium subscription functions (T123)
import { checkSubscriptionExpiry } from "./check-subscription-expiry";

export type InngestEvents = {
  // TIP: Add your events here, where key is the event name and value is the event data format
  "test/hello.world": {
    data: {
      email: string;
    };
  };
  "devcard/sync.github": {
    data: {
      userId: string;
      devCardId: string;
    };
  };
};

// TIP: Add your functions here, failing this will result in function not being registered
export const functions = [
  helloWorld,
  expireCredits,
  syncGitHubData,
  dailyGitHubSync,
  aggregateAnalytics,
  cleanupAnalytics,
  // Premium subscription functions (T123)
  checkSubscriptionExpiry,
];
