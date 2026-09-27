import { describe, expect, it } from 'vitest';

import {
  isAcceptablePassword,
  isValidEmail,
  isValidGithubUsername,
  isValidHttpUrl,
  isValidIsoDate,
  isValidYear,
  validateEducationEntry,
  validateExperienceEntry,
  validateForgotPasswordForm,
  validateGithubUsernameField,
  validateLoginForm,
  validateProfileForm,
  validateProjectForm,
  validateRegisterForm,
  validateTaskForm,
  hasErrors,
  type ProjectFormValues,
} from '@/utils/validation';
import { LIMITS } from '@/utils/constants';

const emptyProject: ProjectFormValues = {
  name: '',
  description: '',
  category: 'Web App',
  status: 'planning',
  technologies: [],
  githubUrl: '',
  liveUrl: '',
  imageUrl: '',
  progress: 0,
  progressMode: 'manual',
  startDate: '2025-01-01',
  endDate: '',
};

const validProject: ProjectFormValues = {
  ...emptyProject,
  name: 'Habitloop',
  description: 'A habit tracker with streaks and a visual timeline.',
  technologies: ['React', 'TypeScript'],
};

describe('primitive validators', () => {
  it('accepts real email addresses and rejects malformed ones', () => {
    expect(isValidEmail('dev@example.com')).toBe(true);
    expect(isValidEmail('first.last+tag@sub.example.co.uk')).toBe(true);
    expect(isValidEmail('no-at-sign')).toBe(false);
    expect(isValidEmail('spaces in@mail.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('validates GitHub usernames', () => {
    expect(isValidGithubUsername('octocat')).toBe(true);
    expect(isValidGithubUsername('a-b-1')).toBe(true);
    expect(isValidGithubUsername('-leading')).toBe(false);
    expect(isValidGithubUsername('double--hyphen')).toBe(false);
    expect(isValidGithubUsername('has space')).toBe(false);
    expect(isValidGithubUsername('a'.repeat(40))).toBe(false);
  });

  it('requires http(s) URLs', () => {
    expect(isValidHttpUrl('https://example.com')).toBe(true);
    expect(isValidHttpUrl('http://example.com/path?x=1')).toBe(true);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('example.com')).toBe(false);
    expect(isValidHttpUrl('  ')).toBe(false);
  });

  it('validates ISO dates and years', () => {
    expect(isValidIsoDate('2025-04-02')).toBe(true);
    expect(isValidIsoDate('2025-13-40')).toBe(false);
    expect(isValidIsoDate('02-04-2025')).toBe(false);
    expect(isValidYear('2019')).toBe(true);
    expect(isValidYear('19')).toBe(false);
  });

  it('enforces the password policy', () => {
    expect(isAcceptablePassword('short1')).toBe(false);
    expect(isAcceptablePassword('longenough1')).toBe(true);
    expect(isAcceptablePassword('12345678')).toBe(false);
    expect(isAcceptablePassword('abcdefgh')).toBe(false);
    expect(isAcceptablePassword('secure12')).toBe(true);
  });
});

describe('auth forms', () => {
  it('reports every problem in the register form at once', () => {
    const errors = validateRegisterForm({ name: '', email: 'nope', password: 'abc', confirmPassword: '' });
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
    expect(hasErrors(errors)).toBe(true);
  });

  it('accepts a valid register form', () => {
    const errors = validateRegisterForm({
      name: 'Sam',
      email: 'sam@example.com',
      password: 'hunter22',
      confirmPassword: 'hunter22',
    });
    expect(hasErrors(errors)).toBe(false);
  });

  it('rejects a mismatched password confirmation', () => {
    const errors = validateRegisterForm({
      name: 'Sam',
      email: 'sam@example.com',
      password: 'hunter22',
      confirmPassword: 'hunter23',
    });
    expect(errors.confirmPassword).toBeTruthy();
  });

  it('mirrors the Firestore rules length caps so writes never fail with permission-denied', () => {
    const base = {
      name: 'Sam',
      email: 'sam@example.com',
      avatar: 'https://example.com/a.png',
      bio: '',
      location: '',
      githubUsername: '',
      linkedinUrl: '',
      portfolioUrl: '',
      skills: [],
      education: [],
      experience: [],
    };

    expect(validateProfileForm({ ...base, avatar: `https://example.com/${'a'.repeat(1200)}` }).avatar).toBeTruthy();
    expect(validateProfileForm({ ...base, linkedinUrl: `https://example.com/${'a'.repeat(400)}` }).linkedinUrl)
      .toBeTruthy();
    expect(validateProfileForm({ ...base, location: 'x'.repeat(200) }).location).toBeTruthy();
    expect(validateProfileForm({ ...base, name: 'x'.repeat(80) }).name).toBeTruthy();
    expect(validateProfileForm({ ...base, bio: 'x'.repeat(500) }).bio).toBeTruthy();
    expect(validateProfileForm(base)).toEqual({});
  });

  it('validates login and password reset forms', () => {
    expect(validateLoginForm({ email: 'sam@example.com', password: 'hunter22' })).toEqual({});
    expect(validateLoginForm({ email: 'sam@example.com', password: '' }).password).toBeTruthy();
    expect(validateForgotPasswordForm({ email: '' }).email).toBeTruthy();
  });
});

describe('project form', () => {
  it('requires a name', () => {
    const errors = validateProjectForm({ ...emptyProject, name: '   ' });
    expect(errors.name).toBeTruthy();
  });

  it('rejects an end date before the start date', () => {
    const errors = validateProjectForm({ ...emptyProject, name: 'App', startDate: '2025-05-01', endDate: '2025-04-01' });
    expect(errors.endDate).toBeTruthy();
  });

  it('rejects out-of-range progress', () => {
    expect(validateProjectForm({ ...validProject, progress: 120 }).progress).toBeTruthy();
    expect(validateProjectForm({ ...validProject, progress: -1 }).progress).toBeTruthy();
    expect(validateProjectForm({ ...validProject, progress: 100 })).toEqual({});
  });

  it('requires a description and at least one technology', () => {
    expect(validateProjectForm({ ...emptyProject, name: 'App' }).description).toBeTruthy();
    expect(validateProjectForm({ ...emptyProject, name: 'App' }).technologies).toBeTruthy();
  });

  it('requires 100% progress for a completed project in manual mode', () => {
    expect(validateProjectForm({ ...validProject, status: 'completed', progress: 40 }).progress).toBeTruthy();
  });

  it('rejects invalid links', () => {
    const errors = validateProjectForm({
      ...validProject,
      githubUrl: 'not-a-url',
      liveUrl: 'javascript:alert(1)',
    });
    expect(errors.githubUrl).toBeTruthy();
    expect(errors.liveUrl).toBeTruthy();
  });

  it('limits the technology list', () => {
    const many = Array.from({ length: LIMITS.technologies + 1 }, (_, index) => `tech-${index}`);
    expect(validateProjectForm({ ...validProject, technologies: many }).technologies).toBeTruthy();
  });
});

describe('task form', () => {
  it('requires a title', () => {
    expect(validateTaskForm({ title: '  ', description: '' }).title).toBeTruthy();
    expect(validateTaskForm({ title: 'Ship it', description: '' })).toEqual({});
  });
});

describe('profile form', () => {
  const base = {
    name: 'Sam Rivera',
    bio: 'Builder',
    location: 'Amsterdam',
    githubUsername: 'octocat',
    linkedinUrl: 'https://linkedin.com/in/sam',
    portfolioUrl: 'https://sam.dev',
    skills: ['React'],
    avatar: 'https://example.com/a.png',
  };

  it('accepts a complete profile', () => {
    expect(validateProfileForm(base)).toEqual({});
  });

  it('rejects a bad username and a non-http link', () => {
    const errors = validateProfileForm({
      ...base,
      githubUsername: 'bad user',
      portfolioUrl: 'ftp://example.com',
    });
    expect(errors.githubUsername).toBeTruthy();
    expect(errors.portfolioUrl).toBeTruthy();
  });

  it('rejects duplicate skills', () => {
    const errors = validateProfileForm({ ...base, skills: ['React', 'react'] });
    expect(errors.skills).toBeTruthy();
  });
});

describe('education and experience entries', () => {
  it('requires an institution and degree', () => {
    const errors = validateEducationEntry({
      id: '1',
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      description: '',
    });
    expect(errors.institution).toBeTruthy();
    expect(errors.degree).toBeTruthy();
  });

  it('rejects an end year before the start year', () => {
    const errors = validateEducationEntry({
      id: '1',
      institution: 'UT',
      degree: 'BSc',
      field: '',
      startYear: '2022',
      endYear: '2019',
      description: '',
    });
    expect(errors.endYear).toBeTruthy();
  });

  it('rejects an end date on a current role', () => {
    const errors = validateExperienceEntry({
      id: '1',
      company: 'Acme',
      role: 'Engineer',
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      current: true,
      description: '',
    });
    expect(errors.endDate).toBeTruthy();
  });
});

describe('github username field', () => {
  it('allows an empty value when it is optional', () => {
    expect(validateGithubUsernameField('', { required: false })).toBeUndefined();
    expect(validateGithubUsernameField('', { required: true })).toBeTruthy();
    expect(validateGithubUsernameField('octocat', { required: false })).toBeUndefined();
  });
});
