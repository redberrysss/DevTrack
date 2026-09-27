import { LegalPageView, type LegalSection } from './LegalPageView';

const sections: LegalSection[] = [
  {
    id: 'overview',
    heading: 'Overview',
    paragraphs: [
      'DevTrack stores the data you enter so it can be shown back to you: the projects you create, the tasks under each project, and the profile you fill in. This page explains exactly what is stored, where it is stored, and who can read it.',
      'DevTrack is a self-hosted application. Each deployment is connected to its own Firebase project, so the data belongs to whoever operates that deployment. Nothing is shared between deployments or between accounts.',
    ],
  },
  {
    id: 'data-collected',
    heading: 'Data DevTrack stores',
    paragraphs: ['To operate your account and render your workspace, DevTrack stores the following data about you:'],
    list: [
      'Account data held by Firebase Authentication: your email address, a hashed password, whether the address is verified, and the display name you set.',
      'Profile data in Cloud Firestore: your name, bio, location, skills, education entries, experience entries, avatar image reference and the social links you add.',
      'Projects in Cloud Firestore: the name, description, category, status, technologies, live URL, repository URL, image URL, progress, dates and the tasks attached to each project.',
      'Tasks in Cloud Firestore: the title, description, completion state and timestamps for every task you create.',
    ],
  },
  {
    id: 'github',
    heading: 'GitHub data',
    paragraphs: [
      'If you connect a GitHub username, DevTrack requests public profile and repository data from the official GitHub REST API and displays it. That data is not stored in Firestore — it is cached in your browser for up to five minutes and discarded afterwards.',
      'DevTrack never asks for your GitHub password, personal access token or OAuth scope. It cannot read private repositories, and it never writes anything back to your GitHub account.',
    ],
  },
  {
    id: 'avatars',
    heading: 'Avatars and images',
    paragraphs: [
      'If you upload an avatar, the image file is stored in Cloud Storage in a private path scoped to your user ID. The upload is validated to be an image of an accepted type and a limited size, and images are served back to you through a read path that your security rules control.',
      'You can remove an uploaded avatar at any time, which deletes the stored file. You can also provide an external image URL instead, in which case no file is uploaded at all.',
    ],
  },
  {
    id: 'tracking',
    heading: 'Analytics and tracking',
    paragraphs: [
      'DevTrack does not embed third-party analytics, advertising pixels or session-recording scripts. No data is sold or shared with advertisers.',
    ],
  },
  {
    id: 'cookies',
    heading: 'Local storage',
    paragraphs: [
      'DevTrack stores two things in your browser: your theme preference, and a short-lived cache of public GitHub responses. Both are readable only by this site. DevTrack uses no advertising or cross-site tracking cookies.',
    ],
  },
  {
    id: 'retention',
    heading: 'Retention and deletion',
    paragraphs: [
      'Your data is kept for as long as your account exists. Deleting a project also deletes its tasks. Removing a project or task is immediate and permanent.',
      'To delete your entire account and all associated data, contact the operator of this deployment. Account deletion removes your Firestore documents, your stored avatar and your authentication record.',
    ],
  },
  {
    id: 'security',
    heading: 'How your data is protected',
    paragraphs: [
      'Every read and write goes through Firebase security rules, so the browser never talks to the database directly. Firestore rules require an authenticated user for every operation and only allow access to documents that belong to that user.',
      'Passwords are hashed and managed by Firebase Authentication; DevTrack never sees or stores your password in plain text. Traffic to Firebase is served over TLS.',
    ],
  },
  {
    id: 'rights',
    heading: 'Your rights',
    paragraphs: [
      'You can view and edit every piece of your data from inside the app at any time, and export it by copying it out of the project and profile pages. Because you are the only principal with access to your documents, you can also export a full backup through the Firebase tooling you control.',
      'You may request deletion of your data at any time. You may also ask what data is held about you, and object to any processing of it.',
    ],
  },
];

const contact: LegalSection = {
  id: 'contact',
  heading: 'Contact',
  paragraphs: [
    'Questions about this policy, or a request to access or delete your data, can be sent to the operator of this DevTrack deployment.',
  ],
};

export default function PrivacyPage() {
  return (
    <LegalPageView
      title="Privacy policy"
      metaDescription="What DevTrack stores, why it stores it, and how to get it back or deleted."
      intro="DevTrack is built so that your developer data stays yours. This policy describes the data the app handles and the guarantees the app is built on."
      sections={sections}
      contact={contact}
    />
  );
}
