# Student Registration Form – Automated Test Suite

**Midterm Exam | Automated Software Testing**  
**URL Under Test:** https://demoqa.com/automation-practice-form  
**Tool:** Playwright (TypeScript)  
**Testing Technique:** Equivalence Partitioning (EP) + Boundary Value Analysis (BVA)

---

## Project Structure

```
student-registration-tests/
├── fixtures/
│   └── test-image.jpg             # Test fixture: dummy JPEG for file-upload test
├── tests/
│   ├── pages/
│   │   └── RegistrationFormPage.ts  # Page Object Model (POM)
│   ├── test-data/
│   │   └── equivalence-partitions.ts  # EP/BVA test data & partition definitions
│   └── student-registration.spec.ts   # Main test specification (37 tests)
├── global-setup.ts                # Global setup (creates fixture JPEG)
├── playwright.config.ts           # Playwright configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json
└── README.md
```

---

## Testing Technique: Equivalence Partitioning (EP) + Boundary Value Analysis (BVA)

### Equivalence Partitioning (EP)

**Equivalence Partitioning** is a black-box testing technique that divides the
input domain of each field into **classes (partitions)** where all values within
a partition are expected to behave identically. Testing one representative value
from each class is sufficient to cover the entire class.

| Partition Type | Description | Expected Behaviour |
|---|---|---|
| **Valid Partition** | Input values the system should accept | Form processes successfully |
| **Invalid Partition** | Input values the system should reject | Validation error / no submission |

### Boundary Value Analysis (BVA)

**BVA** extends EP by specifically testing values at the *edges* of partitions.
Most defects occur at boundaries, so this technique is applied to the **Mobile** field
(must be exactly **10 digits**):

| BVA Value | Digits | Boundary Position | Expected Result |
|---|---|---|---|
| `081234567`   | 9  | Below boundary (min − 1) | ❌ INVALID |
| `0812345678`  | 10 | At valid boundary        | ✅ VALID   |
| `08123456789` | 11 | Above boundary (max + 1) | ❌ INVALID |

### EP Partition Table (All Fields)

| Field | Valid Partitions | Invalid Partitions |
|---|---|---|
| First Name | Alphabetic string (≥1 char) | Empty string |
| Last Name | Alphabetic string (≥1 char) | Empty string |
| Email | `name@domain.ext` format | No `@`, no domain extension |
| Gender | Male \| Female \| Other | None selected |
| Mobile | Exactly 10 numeric digits | 9 digits, 11 digits, alpha, symbols, empty |
| Date of Birth | Any valid calendar date | Defaults to today (optional to change) |
| Subjects | ≥1 valid subject from suggestions | (optional field) |
| Hobbies | Any combination of checkboxes | (optional field) |
| Current Address | Any text | (optional field) |
| State | Any state in the dropdown | None selected → City stays disabled |
| City | Any city matching the selected state | City before state = no options |

---

## Test Suites & Acceptance Criteria Coverage

| Suite | Tests | Acceptance Criteria |
|---|---|---|
| **Suite A** – Happy Path & Modal | TC-A01 to TC-A05 (5 tests) | AC1, AC5 |
| **Suite B** – Mandatory Fields Blank | TC-B01 to TC-B05 (5 tests) | AC2 |
| **Suite C** – Subjects Multi-tag | TC-C01 to TC-C04 (4 tests) | AC4 |
| **Suite D** – Dynamic Dropdown | TC-D01 to TC-D05 (5 tests) | AC3, AC7 |
| **Suite E** – Mobile & Email Validation | TC-E01 to TC-E08 (8 tests) | AC6.1, AC6.2 |
| **Suite F** – Date of Birth | TC-F01 to TC-F03 (3 tests) | AC6.3 |
| **Suite G** – Hobbies & Upload | TC-G01 to TC-G04 (4 tests) | Additional coverage |
| **Suite H** – EP Name Field Summary | TC-H0x × 3 (3 tests) | AC1 (parameterized EP) |
| **Total** | **37 tests** | All 7 Acceptance Criteria |

---

## Requirements → Test Mapping

| AC# | Requirement | Test Cases |
|---|---|---|
| AC1 | User can successfully submit form with all valid data | TC-A01, TC-A02, TC-A04, TC-A05, TC-H0x |
| AC2 | Form cannot be submitted if mandatory fields are blank | TC-B01 – TC-B05 |
| AC3 | City options change based on selected State | TC-D02, TC-D03, TC-D04, TC-D05 |
| AC4 | Subjects field allows multiple entries as removable tags | TC-C01 – TC-C04 |
| AC5 | Modal displays exact data entered in the form | TC-A02, TC-D05, TC-F03, TC-G01, TC-G03 |
| AC6.1 | Mobile: exactly 10 digits; no alpha/symbols | TC-E01(BVA), TC-E02(BVA), TC-E03(BVA), TC-E04, TC-E05 |
| AC6.2 | Email: must contain "@" and valid domain | TC-E06, TC-E07, TC-E08 |
| AC6.3 | DOB defaults to today; allows calendar selection | TC-F01, TC-F02, TC-F03 |
| AC7 | City dropdown disabled until State is selected | TC-D01 |

---

## Setup & Running Tests

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
cd student-registration-tests
npm install
npx playwright install chromium
```

### Run Tests

```bash
# Run all tests (headless)
npm test

# Run with browser visible
npm run test:headed

# Run with interactive UI
npm run test:ui

# Debug a specific test
npm run test:debug

# View HTML report after tests
npm run test:report
```

### Run a Specific Suite

```bash
# Run only Suite A (Happy Path)
npx playwright test --grep "Suite A"

# Run only BVA tests
npx playwright test --grep "BVA"

# Run a single test case
npx playwright test --grep "TC-B03"
```

### Run and View Report

```bash
npm test && npm run test:report
```

---

## Architecture Decisions

### Page Object Model (POM)

All UI interactions are encapsulated in `RegistrationFormPage.ts`. This:
- Keeps test logic separate from DOM selectors
- Makes tests readable and maintainable
- Reduces duplication when selectors change

### Ad Blocker (Page Injection)

`demoqa.com` displays fixed-position ad banners that can overlap the Submit
button. The POM uses `page.evaluate()` to hide these elements before interacting
with the form, ensuring reliable test execution.

### Global Setup

`global-setup.ts` runs once before all tests to create the `fixtures/test-image.jpg`
JPEG binary needed for the file-upload test (TC-G04).

---

## EP Technique in Code

Each test case documents its EP class assignment inline:

```typescript
test('TC-E02: Mobile with 9 digits is rejected [BVA – below boundary]', async ({ page }) => {
  /**
   * BVA      : Below boundary (9 digits) → INVALID
   * EP Class : Invalid Partition – fewer than 10 digits
   * Input    : "081234567" (9 digits)
   * Expected : Form does NOT submit; mobile field highlighted red
   */
  ...
});
```

Test data is centralised in `tests/test-data/equivalence-partitions.ts` with
the full EP partition table documented at the top of the file.
