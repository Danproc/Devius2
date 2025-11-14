import { AppConfigPublic } from "./types";

export const appConfig: AppConfigPublic = {
  projectName: "StackPass",
  projectSlug: "stackpass",
  keywords: [
    "StackPass",
    "Developer Profiles",
    "GitHub Integration",
    "Hackathons",
    "Developer Networking",
    "Wallet Pass",
    "DevCard",
  ],
  description:
    "GitHub-powered developer profiles with wallet passes. Enter Sprints and Seasons to win prizes and badges.",
  auth: {
    enablePasswordAuth: false, // Set to true to enable password-based authentication
  },
  legal: {
    address: {
      street: "Plot No 337, Workyard, Phase 2, Industrial Business &amp; Park",
      city: "Chandigarh",
      state: "Punjab",
      postalCode: "160002",
      country: "India",
    },
    email: "ssent.hq@gmail.com",
    phone: "+91 9876543210",
  },
  social: {
    twitter: "https://twitter.com/cjsingg",
    instagram: "https://instagram.com/-",
    linkedin: "https://linkedin.com/-",
    facebook: "https://facebook.com/-",
    youtube: "https://youtube.com/-",
  },
  email: {
    senderName: "StackPass",
    senderEmail: "ssent.hq@gmail.com",
  },
};
