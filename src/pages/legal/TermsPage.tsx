import { LegalPageView, type LegalSection } from './LegalPageView';

const sections: LegalSection[] = [
  {
    id: 'agreement',
    heading: 'Agreement to these terms',
    paragraphs: [
      'By creating an account or using DevTrack you agree to these terms. If you do not agree, do not use the application.',
      'DevTrack is provided by the operator of this deployment. The service is offered as-is, and by continuing to use it you accept the responsibilities described below.',
    ],
  },
  {
    id: 'accounts',
    heading: 'Your account',
    paragraphs: [
      'You are responsible for the activity that happens under your account, including keeping your password confidential. One account is intended for one person or organisation.',
      'You must be old enough to form a binding contract in your jurisdiction, and you may not create an account on behalf of someone else without their permission.',
    ],
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable use',
    paragraphs: ['You agree not to use DevTrack to:'],
    list: [
      'Store or distribute content that is unlawful, or that infringes someone else’s intellectual property rights.',
      'Upload malicious code, or attempt to gain access to another user’s data or to the underlying Firebase services.',
      'Probe, scan or test the security of the deployment without explicit written permission.',
      'Scrape, resell or bulk-export data that belongs to other users, or misuse the public GitHub API data beyond the app’s own caching needs.',
    ],
  },
  {
    id: 'your-content',
    heading: 'Your content and licence',
    paragraphs: [
      'The projects, tasks and profile text you enter remain yours. You grant the operator only the narrow permission needed to host, back up and display that content to you — for example, storing documents in Firestore and serving your avatar from Cloud Storage.',
      'You are responsible for having the right to store and display anything you upload, including images and repository links.',
    ],
  },
  {
    id: 'availability',
    heading: 'Availability and changes',
    paragraphs: [
      'The service is provided on an as-available basis. Firebase outages, third-party API limits (including the GitHub API) or maintenance can make parts of the app temporarily unavailable, and no uptime commitment is made.',
      'Features may be added, changed or removed. Material changes to these terms will be reflected in the “last updated” date at the top of this page, and continuing to use the service after a change means you accept the updated terms.',
    ],
  },
  {
    id: 'termination',
    heading: 'Termination',
    paragraphs: [
      'You can stop using DevTrack and delete your data at any time. The operator may suspend or delete an account that breaches these terms, for example by using the app to store unlawful content or to attack the service.',
      'On termination you can still export your data for as long as the account exists. After deletion, stored data is removed and cannot be recovered by the operator.',
    ],
  },
  {
    id: 'disclaimers',
    heading: 'Disclaimers',
    paragraphs: [
      'To the fullest extent permitted by law, the service is provided without warranties of any kind, whether express or implied, including fitness for a particular purpose. DevTrack is a tracking and showcase tool and is not a professional certification of your work.',
      'To the fullest extent permitted by law, the operator is not liable for indirect, incidental or consequential loss, or for any loss of data arising from actions taken by you in the app.',
    ],
  },
  {
    id: 'governing-law',
    heading: 'Governing law',
    paragraphs: [
      'These terms are governed by the laws of the jurisdiction in which the operator of this deployment is established. Where a provision is unenforceable, the rest of the terms remain in force.',
    ],
  },
];

const contact: LegalSection = {
  id: 'contact',
  heading: 'Questions',
  paragraphs: ['Questions about these terms can be sent to the operator of this DevTrack deployment.'],
};

export default function TermsPage() {
  return (
    <LegalPageView
      title="Terms of service"
      metaDescription="The rules for using DevTrack: your account, acceptable use, your content and availability."
      intro="These terms describe what you can expect from DevTrack and what is expected of you as a user."
      sections={sections}
      contact={contact}
    />
  );
}
