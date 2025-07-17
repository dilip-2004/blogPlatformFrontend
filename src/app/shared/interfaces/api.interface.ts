
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  field?: string;
  code?: string;
  status?: number;
  details?: any;
}


export interface ApiCallState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface ServiceResponse<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

/**
 * Standardized image upload response (for image-upload.service.ts)
 */
export interface ImageUploadResponse {
  imageUrl: string;
  url: string; // alias for compatibility
  success?: boolean;
  message?: string;
}

/**
 * Backend image upload response format
 */
export interface BackendImageUploadResponse {
  success: boolean;
  imageUrl: string;
  message?: string;
}

/**
 * File upload progress tracking
 */
export interface UploadProgress {
  filename: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  size?: number;
}

/**
 * Generic file attachment
 */
export interface FileAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

// ==============================================
// STATE MANAGEMENT INTERFACES
// ==============================================

/**
 * Base state interface for state management services
 */
export interface BaseState {
  loading: boolean;
  error: string | null;
}

/**
 * Entity state with CRUD operations
 */
export interface EntityState<T> extends BaseState {
  items: T[];
  selectedItem: T | null;
  total?: number;
  page?: number;
  hasChanges?: boolean;
}

// ==============================================
// VALIDATION AND FORM INTERFACES
// ==============================================

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

/**
 * Form validation state
 */
export interface FormValidationState {
  isValid: boolean;
  errors: ValidationError[];
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
}

// ==============================================
// NOTIFICATION INTERFACES
// ==============================================

/**
 * Notification/Toast message interface
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

/**
 * Notification action button
 */
export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// ==============================================
// UTILITY INTERFACES
// ==============================================

/**
 * Generic key-value pair
 */
export interface KeyValuePair<T = string> {
  key: string;
  value: T;
  label?: string;
}

/**
 * Select option for dropdowns
 */
export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Menu item interface
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  action?: () => void;
  disabled?: boolean;
  children?: MenuItem[];
}

/**
 * Tab interface for tab components
 */
export interface Tab {
  id: string;
  label: string;
  content?: string;
  component?: any;
  disabled?: boolean;
  icon?: string;
}

// ==============================================
// HTTP AND REQUEST INTERFACES
// ==============================================

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  withCredentials?: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
  maxDelay?: number;
}

// ==============================================
// CONFIGURATION INTERFACES
// ==============================================

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  production: boolean;
  apiUrl: string;
  apiVersion?: string;
  features?: FeatureFlags;
  analytics?: AnalyticsConfig;
}

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  enableComments?: boolean;
  enableLikes?: boolean;
  enableBookmarks?: boolean;
  enableSharing?: boolean;
  enableNotifications?: boolean;
  enableDarkMode?: boolean;
  enableRealTimeUpdates?: boolean;
  enableAISummary?: boolean;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  anonymizeIp?: boolean;
  enableEcommerce?: boolean;
}
