import type { EducationEntry, ExperienceEntry, ProgressMode, ProjectStatus } from '@/types';
import { LIMITS, PROJECT_CATEGORIES, STATUS_VALUES } from './constants';

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

/* -------------------------------------------------------------------------- */
/*                                 Primitives                                  */
/* -------------------------------------------------------------------------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidGithubUsername(value: string): boolean {
  return GITHUB_USERNAME_PATTERN.test(value.trim());
}

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

export function isValidYear(value: string): boolean {
  if (!/^\d{4}$/.test(value)) return false;
  const year = Number(value);
  const current = new Date().getFullYear() + 1;
  return year >= 1900 && year <= current;
}

export function describePassword(value: string): string {
  if (value.length < LIMITS.passwordMin) return `Use at least ${LIMITS.passwordMin} characters.`;
  if (!PASSWORD_PATTERN.test(value)) return 'Include at least one letter and one number.';
  return '';
}

export function isAcceptablePassword(value: string): boolean {
  return value.length >= LIMITS.passwordMin && PASSWORD_PATTERN.test(value);
}

/* -------------------------------------------------------------------------- */
/*                                    Auth                                     */
/* -------------------------------------------------------------------------- */

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateRegisterForm(values: RegisterFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  else if (values.name.trim().length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`;

  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';

  const passwordError = describePassword(values.password);
  if (!values.password) errors.password = 'Password is required.';
  else if (passwordError) errors.password = passwordError;

  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export function validateLoginForm(values: LoginFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';

  if (!values.password) errors.password = 'Password is required.';
  return errors;
}

export function validateForgotPasswordForm(values: { email: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';
  return errors;
}

export interface PasswordChangeValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function validatePasswordChangeForm(values: PasswordChangeValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.currentPassword) errors.currentPassword = 'Enter your current password.';
  if (!values.newPassword) errors.newPassword = 'New password is required.';
  else {
    const passwordError = describePassword(values.newPassword);
    if (passwordError) errors.newPassword = passwordError;
    else if (values.newPassword === values.currentPassword)
      errors.newPassword = 'Choose a password different from your current one.';
  }
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your new password.';
  else if (values.newPassword !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

/* -------------------------------------------------------------------------- */
/*                                  Projects                                   */
/* -------------------------------------------------------------------------- */

export interface ProjectFormValues {
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  progress: number;
  progressMode: ProgressMode;
  startDate: string;
  endDate: string;
}

export function validateProjectForm(values: ProjectFormValues): FieldErrors {
  const errors: FieldErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = 'Project name is required.';
  else if (name.length < 2) errors.name = 'Use at least 2 characters.';
  else if (name.length > LIMITS.projectName) errors.name = `Keep it under ${LIMITS.projectName} characters.`;

  const description = values.description.trim();
  if (!description) errors.description = 'Description is required.';
  else if (description.length < 10) errors.description = 'Use at least 10 characters.';
  else if (description.length > LIMITS.projectDescription)
    errors.description = `Keep it under ${LIMITS.projectDescription} characters.`;

  if (!values.category) errors.category = 'Select a category.';
  else if (!(PROJECT_CATEGORIES as readonly string[]).includes(values.category))
    errors.category = 'Select a valid category.';

  if (!values.status) errors.status = 'Select a status.';
  else if (!STATUS_VALUES.includes(values.status)) errors.status = 'Select a valid status.';

  const technologies = values.technologies.map((item) => item.trim()).filter(Boolean);
  if (technologies.length === 0) errors.technologies = 'Add at least one technology.';
  else if (technologies.length > LIMITS.technologies)
    errors.technologies = `Add up to ${LIMITS.technologies} technologies.`;
  else if (technologies.some((item) => item.length > LIMITS.technologyLength))
    errors.technologies = `Technologies must be under ${LIMITS.technologyLength} characters.`;
  else if (new Set(technologies.map((item) => item.toLowerCase())).size !== technologies.length)
    errors.technologies = 'Technologies must be unique.';

  if (values.githubUrl.trim() && !isValidHttpUrl(values.githubUrl))
    errors.githubUrl = 'Enter a full URL starting with http:// or https://.';
  if (values.liveUrl.trim() && !isValidHttpUrl(values.liveUrl))
    errors.liveUrl = 'Enter a full URL starting with http:// or https://.';
  if (values.imageUrl.trim() && !isValidHttpUrl(values.imageUrl))
    errors.imageUrl = 'Enter a full image URL starting with http:// or https://.';

  if (values.progressMode === 'manual') {
    if (!Number.isInteger(values.progress)) errors.progress = 'Progress must be a whole number.';
    else if (values.progress < 0 || values.progress > 100) errors.progress = 'Progress must be between 0 and 100.';
  }

  if (!values.startDate) errors.startDate = 'Start date is required.';
  else if (!isValidIsoDate(values.startDate)) errors.startDate = 'Enter a valid date.';

  if (values.endDate) {
    if (!isValidIsoDate(values.endDate)) errors.endDate = 'Enter a valid date.';
    else if (values.startDate && isValidIsoDate(values.startDate) && values.endDate < values.startDate)
      errors.endDate = 'End date cannot be before the start date.';
  }

  if (values.status === 'completed' && values.progressMode === 'manual' && values.progress !== 100 && !errors.progress)
    errors.progress = 'Completed projects should be at 100%.';

  return errors;
}

export interface TaskFormValues {
  title: string;
  description: string;
}

export function validateTaskForm(values: TaskFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const title = values.title.trim();
  if (!title) errors.title = 'Task title is required.';
  else if (title.length > LIMITS.taskTitle) errors.title = `Keep it under ${LIMITS.taskTitle} characters.`;
  if (values.description.trim().length > LIMITS.taskDescription)
    errors.description = `Keep it under ${LIMITS.taskDescription} characters.`;
  return errors;
}

/* -------------------------------------------------------------------------- */
/*                                  Profile                                    */
/* -------------------------------------------------------------------------- */

export interface ProfileFormValues {
  name: string;
  bio: string;
  location: string;
  githubUsername: string;
  linkedinUrl: string;
  portfolioUrl: string;
  skills: string[];
  avatar: string;
}

export function validateProfileForm(values: ProfileFormValues): FieldErrors {
  const errors: FieldErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = 'Name is required.';
  else if (name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`;

  // The length caps mirror `firestore.rules` exactly, so an over-long value is
  // reported in the form instead of coming back as an opaque permission-denied.
  if (values.bio.trim().length > LIMITS.bio) errors.bio = `Keep it under ${LIMITS.bio} characters.`;
  if (values.location.trim().length > LIMITS.location)
    errors.location = `Keep it under ${LIMITS.location} characters.`;

  if (values.githubUsername.trim() && !isValidGithubUsername(values.githubUsername))
    errors.githubUsername = 'Use a valid GitHub username (letters, numbers and single hyphens).';

  if (values.linkedinUrl.trim() && !isValidHttpUrl(values.linkedinUrl))
    errors.linkedinUrl = 'Enter a full URL starting with http:// or https://.';
  else if (values.linkedinUrl.trim().length > LIMITS.profileUrl)
    errors.linkedinUrl = `Keep it under ${LIMITS.profileUrl} characters.`;

  if (values.portfolioUrl.trim() && !isValidHttpUrl(values.portfolioUrl))
    errors.portfolioUrl = 'Enter a full URL starting with http:// or https://.';
  else if (values.portfolioUrl.trim().length > LIMITS.profileUrl)
    errors.portfolioUrl = `Keep it under ${LIMITS.profileUrl} characters.`;

  if (values.avatar.trim() && !isValidHttpUrl(values.avatar))
    errors.avatar = 'Enter a full image URL starting with http:// or https://.';
  else if (values.avatar.trim().length > LIMITS.avatarUrl)
    errors.avatar = `Keep it under ${LIMITS.avatarUrl} characters.`;

  const skills = values.skills.map((skill) => skill.trim()).filter(Boolean);
  if (skills.length > LIMITS.skills) errors.skills = `Add up to ${LIMITS.skills} skills.`;
  else if (skills.some((skill) => skill.length > LIMITS.skillLength))
    errors.skills = `Skills must be under ${LIMITS.skillLength} characters.`;
  else if (new Set(skills.map((skill) => skill.toLowerCase())).size !== skills.length)
    errors.skills = 'Skills must be unique.';

  return errors;
}

export function validateEducationEntry(entry: EducationEntry): FieldErrors {
  const errors: FieldErrors = {};
  if (!entry.institution.trim()) errors.institution = 'Institution is required.';
  else if (entry.institution.trim().length > LIMITS.institution)
    errors.institution = `Keep it under ${LIMITS.institution} characters.`;

  if (!entry.degree.trim()) errors.degree = 'Degree is required.';

  if (entry.startYear) {
    if (!isValidYear(entry.startYear)) errors.startYear = 'Use a 4-digit year.';
    else if (entry.endYear && isValidYear(entry.endYear) && Number(entry.endYear) < Number(entry.startYear))
      errors.endYear = 'End year cannot be before the start year.';
  }
  if (entry.endYear && !isValidYear(entry.endYear)) errors.endYear = 'Use a 4-digit year.';

  return errors;
}

export function validateExperienceEntry(entry: ExperienceEntry): FieldErrors {
  const errors: FieldErrors = {};
  if (!entry.company.trim()) errors.company = 'Company is required.';
  else if (entry.company.trim().length > LIMITS.company) errors.company = `Keep it under ${LIMITS.company} characters.`;

  if (!entry.role.trim()) errors.role = 'Role is required.';
  else if (entry.role.trim().length > LIMITS.role) errors.role = `Keep it under ${LIMITS.role} characters.`;

  if (entry.startDate && !isValidIsoDate(entry.startDate)) errors.startDate = 'Enter a valid date.';
  if (entry.current && entry.endDate) errors.endDate = 'Remove the end date for a current role.';
  else if (!entry.current && entry.endDate) {
    if (!isValidIsoDate(entry.endDate)) errors.endDate = 'Enter a valid date.';
    else if (entry.startDate && entry.endDate < entry.startDate)
      errors.endDate = 'End date cannot be before the start date.';
  }

  return errors;
}

/* -------------------------------------------------------------------------- */
/*                                  Settings                                   */
/* -------------------------------------------------------------------------- */

export function validateGithubUsernameField(value: string, { required = true } = {}): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return required ? 'GitHub username is required.' : undefined;
  if (!isValidGithubUsername(trimmed)) return 'Use a valid GitHub username (letters, numbers and single hyphens).';
  return undefined;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
