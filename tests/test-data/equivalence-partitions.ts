/**
 * =============================================================================
 * Equivalence Partitioning (EP) + Boundary Value Analysis (BVA) - Test Data
 * =============================================================================
 *
 * SOFTWARE TESTING TECHNIQUE: EQUIVALENCE PARTITIONING (EP)
 * ----------------------------------------------------------
 * Equivalence Partitioning divides input domains into classes (partitions) where
 * every value in a partition is expected to behave identically. Testing one
 * representative value from each partition is sufficient to cover the entire class.
 *
 * Combined with BOUNDARY VALUE ANALYSIS (BVA) which tests values at the edge
 * (boundaries) of partitions — particularly useful for the 10-digit Mobile field.
 *
 * PARTITION DESIGN:
 * -----------------
 * For each input field we define:
 *  ✓ VALID partition(s)   → form should accept & process the value
 *  ✗ INVALID partition(s) → form should reject / show error
 *
 * Field-by-field EP table
 * ══════════════════════════════════════════════════════════════════════════
 * Field         Valid Classes              Invalid Classes
 * ──────────────────────────────────────────────────────────────────────────
 * First Name    Alphabetic string          Empty string
 * Last Name     Alphabetic string          Empty string
 * Email         name@domain.ext            No "@",  no domain, empty
 * Gender        Male | Female | Other      None selected (mandatory)
 * Mobile (BVA)  Exactly 10 digits          9 digits (lower boundary−1)
 *                                          11 digits (upper boundary+1)
 *                                          Alpha chars / symbols
 * Date of Birth Calendar date (any valid)  (optional; defaults to today)
 * Subjects      ≥1 valid subject tag       (optional field)
 * Hobbies       ≥0 checkboxes              (optional field)
 * Address       Any text                   (optional field)
 * State         Any state in list          No state selected → City disabled
 * City          Any city matching state    City before state → should be empty
 * ══════════════════════════════════════════════════════════════════════════
 */

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  dateOfBirth?: string; // "DD MMM YYYY"
  subjects?: string[];
  hobbies?: Array<'Sports' | 'Reading' | 'Music'>;
  currentAddress?: string;
  state?: string;
  city?: string;
}

// ---------------------------------------------------------------------------
// EP CLASS 1: VALID — All mandatory + optional fields filled correctly
// ---------------------------------------------------------------------------
export const VALID_COMPLETE_FORM: FormData = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  gender: 'Male',
  mobile: '0812345678', // exactly 10 digits ✓
  dateOfBirth: '15 Jan 2000',
  subjects: ['Maths', 'Physics'],
  hobbies: ['Sports', 'Reading'],
  currentAddress: '123 Test Street, Bangkok 10110',
  state: 'NCR',
  city: 'Delhi',
};

// EP CLASS 2: VALID — Only mandatory fields filled (minimal valid submission)
export const VALID_MANDATORY_ONLY: FormData = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: '',           // Email is NOT mandatory per AC2 (not listed)
  gender: 'Female',
  mobile: '0987654321', // exactly 10 digits ✓
};

// EP CLASS 3: VALID — Gender = Other
export const VALID_GENDER_OTHER: FormData = {
  firstName: 'Alex',
  lastName: 'Taylor',
  email: 'alex@test.org',
  gender: 'Other',
  mobile: '0711223344',
};

// ---------------------------------------------------------------------------
// BVA for Mobile Number (must be exactly 10 digits)
// Boundary: [10 digits] = valid boundary
//           [9 digits]  = just below valid boundary → INVALID
//           [11 digits] = just above valid boundary → INVALID
// ---------------------------------------------------------------------------
export const BVA_MOBILE_VALID_10: string   = '0812345678';   // exactly 10 ✓
export const BVA_MOBILE_LOW_9: string      = '081234567';    // 9 digits   ✗
export const BVA_MOBILE_HIGH_11: string    = '08123456789';  // 11 digits  ✗
export const BVA_MOBILE_ALPHA: string      = 'ABCDEFGHIJ';   // alphabetic ✗
export const BVA_MOBILE_SPECIAL: string    = '081@#$%678';   // symbols    ✗
export const BVA_MOBILE_EMPTY: string      = '';             // empty      ✗

// ---------------------------------------------------------------------------
// EP INVALID CLASSES — Email
// EP-E1: no "@" symbol
// EP-E2: no domain extension
// EP-E3: valid email format
// ---------------------------------------------------------------------------
export const INVALID_EMAIL_NO_AT: string         = 'invalidemail.com';
export const INVALID_EMAIL_NO_DOMAIN: string     = 'invalid@';
export const VALID_EMAIL_FORMAT: string          = 'valid@domain.com';

// ---------------------------------------------------------------------------
// EP INVALID CLASSES — Mandatory fields blank
// Tests that form submission is rejected when each mandatory field is empty
// ---------------------------------------------------------------------------
export const MISSING_FIRSTNAME: Partial<FormData> = {
  firstName: '',
  lastName: 'Smith',
  gender: 'Male',
  mobile: '0812345678',
};

export const MISSING_LASTNAME: Partial<FormData> = {
  firstName: 'John',
  lastName: '',
  gender: 'Male',
  mobile: '0812345678',
};

export const MISSING_GENDER: Partial<FormData> = {
  firstName: 'John',
  lastName: 'Smith',
  // gender intentionally omitted
  mobile: '0812345678',
};

export const MISSING_MOBILE: Partial<FormData> = {
  firstName: 'John',
  lastName: 'Smith',
  gender: 'Male',
  mobile: '',
};

export const ALL_FIELDS_BLANK: Partial<FormData> = {
  firstName: '',
  lastName: '',
  // no gender
  mobile: '',
};

// ---------------------------------------------------------------------------
// State–City mapping (for Dynamic Dropdown tests AC3 & AC7)
// ---------------------------------------------------------------------------
export const STATE_CITY_MAP: Record<string, string[]> = {
  'NCR':         ['Delhi', 'Gurgaon', 'Noida'],
  'Uttar Pradesh': ['Agra', 'Lucknow', 'Merrut'],
  'Haryana':     ['Karnal', 'Panipat'],
  'Rajasthan':   ['Jaipur', 'Jaiselmer'],
};

export const STATE_LIST = Object.keys(STATE_CITY_MAP);
