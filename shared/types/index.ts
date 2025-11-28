/**
 * Shared TypeScript types and interfaces for EHRMS
 */

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum Role {
  ADMIN = 'admin',
  CLINICIAN = 'clinician',
  CASE_MANAGER = 'case_manager',
  BILLING = 'billing',
  PROVIDER = 'provider',
  SYSTEM_ADMIN = 'system_admin',
}

export interface Permission {
  resource: string;
  action: string[];
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Client/Patient Types
export interface Client {
  id: string;
  clientNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  ssn?: string;
  address: Address;
  contactInfo: ContactInfo;
  enrollmentDate: Date;
  programs: Program[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  emergencyContact?: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export enum Program {
  BEHAVIORAL_HEALTH = 'behavioral_health',
  AGING = 'aging',
  HOUSING = 'housing',
  TRANSPORTATION = 'transportation',
  CCS = 'ccs',
  CLTS = 'clts',
  CRISIS_INTERVENTION = 'crisis_intervention',
}

// Case Management Types
export interface Case {
  id: string;
  caseNumber: string;
  clientId: string;
  assignedTo: string;
  program: Program;
  status: CaseStatus;
  priority: Priority;
  openedDate: Date;
  closedDate?: Date;
  servicePlan?: ServicePlan;
  notes: CaseNote[];
  linkedCases?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  CLOSED = 'closed',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ServicePlan {
  id: string;
  caseId: string;
  goals: Goal[];
  services: AuthorizedService[];
  startDate: Date;
  endDate?: Date;
  status: ServicePlanStatus;
}

export interface Goal {
  id: string;
  description: string;
  targetDate: Date;
  status: GoalStatus;
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ACHIEVED = 'achieved',
  DISCONTINUED = 'discontinued',
}

export enum ServicePlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface AuthorizedService {
  id: string;
  serviceCode: string;
  serviceName: string;
  providerId?: string;
  units: number;
  unitRate: number;
  startDate: Date;
  endDate?: Date;
  status: ServiceAuthorizationStatus;
}

export enum ServiceAuthorizationStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DENIED = 'denied',
}

export interface CaseNote {
  id: string;
  caseId: string;
  authorId: string;
  noteType: NoteType;
  content: string;
  isConfidential: boolean;
  createdAt: Date;
}

export enum NoteType {
  PROGRESS = 'progress',
  ASSESSMENT = 'assessment',
  INCIDENT = 'incident',
  GENERAL = 'general',
}

// Scheduling Types
export interface Appointment {
  id: string;
  clientId: string;
  caseId?: string;
  providerId: string;
  serviceId?: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  type: AppointmentType;
  location: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum AppointmentType {
  IN_PERSON = 'in_person',
  TELEHEALTH = 'telehealth',
  HOME_VISIT = 'home_visit',
  GROUP = 'group',
}

export interface BedAssignment {
  id: string;
  bedId: string;
  clientId: string;
  caseId?: string;
  checkInDate: Date;
  checkOutDate?: Date;
  status: BedStatus;
  notes?: string;
}

export enum BedStatus {
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  AVAILABLE = 'available',
  MAINTENANCE = 'maintenance',
}

// Billing Types
export interface Claim {
  id: string;
  claimNumber: string;
  clientId: string;
  caseId?: string;
  providerId: string;
  serviceId: string;
  serviceDate: Date;
  units: number;
  unitRate: number;
  totalAmount: number;
  payer: Payer;
  status: ClaimStatus;
  submittedDate?: Date;
  paidDate?: Date;
  paidAmount?: number;
  denialReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Payer {
  MEDICAID = 'medicaid',
  MEDICARE = 'medicare',
  COMMERCIAL = 'commercial',
  SELF_PAY = 'self_pay',
}

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  PAID = 'paid',
  DENIED = 'denied',
  APPEALED = 'appealed',
}

export interface Payment {
  id: string;
  claimId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  postedDate: Date;
}

export enum PaymentMethod {
  EFT = 'eft',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
}

// Provider Types
export interface Provider {
  id: string;
  npi?: string;
  name: string;
  type: ProviderType;
  address: Address;
  contactInfo: ContactInfo;
  credentials: Credential[];
  contracts: Contract[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProviderType {
  INDIVIDUAL = 'individual',
  AGENCY = 'agency',
  FACILITY = 'facility',
}

export interface Credential {
  type: string;
  number: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date;
  isActive: boolean;
}

export interface Contract {
  id: string;
  providerId: string;
  program: Program;
  startDate: Date;
  endDate?: Date;
  rateSchedule: RateSchedule[];
  status: ContractStatus;
}

export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
}

export interface RateSchedule {
  serviceCode: string;
  unitRate: number;
  effectiveDate: Date;
}

// Document Types
export interface Document {
  id: string;
  clientId?: string;
  caseId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  documentType: DocumentType;
  uploadedBy: string;
  uploadedAt: Date;
  isConfidential: boolean;
  tags?: string[];
}

export enum DocumentType {
  INTAKE_FORM = 'intake_form',
  ASSESSMENT = 'assessment',
  SERVICE_PLAN = 'service_plan',
  PROGRESS_NOTE = 'progress_note',
  CONSENT_FORM = 'consent_form',
  IDENTIFICATION = 'identification',
  MEDICAL_RECORD = 'medical_record',
  OTHER = 'other',
}

// Audit Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: Pagination;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Integration Types
export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  endpoint: string;
  credentials: Record<string, string>;
  isActive: boolean;
  lastSyncAt?: Date;
}

export enum IntegrationType {
  TYLER_MUNIS = 'tyler_munis',
  WI_DHS = 'wi_dhs',
  MEDICAID = 'medicaid',
  HL7 = 'hl7',
  FHIR = 'fhir',
  EDI = 'edi',
}

