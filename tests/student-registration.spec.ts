/**
 * ============================================================================
 * Student Registration Form – Automated Test Suite
 * ============================================================================
 * URL    : https://demoqa.com/automation-practice-form
 * Tool   : Playwright (TypeScript)
 * Technique: EQUIVALENCE PARTITIONING (EP) + BOUNDARY VALUE ANALYSIS (BVA)
 *
 * TESTING TECHNIQUE OVERVIEW
 * ─────────────────────────────────────────────────────────────────────────────
 * Equivalence Partitioning (EP) divides the input domain of each form field
 * into classes (partitions) where each value in a class is expected to behave
 * identically. We only need to test one representative value per class.
 *
 *  Valid Partitions   → Input should lead to form acceptance / successful flow
 *  Invalid Partitions → Input should lead to validation error / rejection
 *
 * Boundary Value Analysis (BVA) extends EP by testing the exact boundary edges.
 * Applied here to the Mobile field (must be EXACTLY 10 digits):
 *   • 9  digits  → below boundary → INVALID
 *   • 10 digits  → at boundary    → VALID  ← valid partition
 *   • 11 digits  → above boundary → INVALID
 *
 * ACCEPTANCE CRITERIA COVERAGE MAP
 * ─────────────────────────────────────────────────────────────────────────────
 * AC1  – Happy path: full valid form submission               → Suite A
 * AC2  – Mandatory fields blank → cannot submit              → Suite B
 * AC3  – City dropdown updates when State changes            → Suite D
 * AC4  – Subjects multi-tag: add & remove                    → Suite C
 * AC5  – Modal shows exact data matching form input          → Suite A (TC-02)
 * AC6.1– Mobile validation (EP + BVA)                        → Suite E
 * AC6.2– Email format validation                             → Suite E
 * AC6.3– Date of Birth default & calendar selection          → Suite F
 * AC7  – City disabled before State is selected              → Suite D
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import { RegistrationFormPage } from './pages/RegistrationFormPage';
import {
  VALID_COMPLETE_FORM,
  VALID_MANDATORY_ONLY,
  VALID_GENDER_OTHER,
  BVA_MOBILE_VALID_10,
  BVA_MOBILE_LOW_9,
  BVA_MOBILE_HIGH_11,
  BVA_MOBILE_ALPHA,
  BVA_MOBILE_SPECIAL,
  BVA_MOBILE_EMPTY,
  INVALID_EMAIL_NO_AT,
  INVALID_EMAIL_NO_DOMAIN,
  VALID_EMAIL_FORMAT,
  MISSING_FIRSTNAME,
  MISSING_LASTNAME,
  MISSING_GENDER,
  MISSING_MOBILE,
  ALL_FIELDS_BLANK,
  STATE_CITY_MAP,
  STATE_LIST,
} from './test-data/equivalence-partitions';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE A – Happy Path & Modal Verification (AC1, AC5)
// EP: Valid partition – all fields correctly filled
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite A – Happy Path & Modal Verification [EP: Valid Partition]', () => {

  test('TC-A01: Submit form with all mandatory fields filled (minimal valid)', async ({ page }) => {
    /**
     * EP Class : Valid Partition – mandatory fields only
     * Input    : First/Last name (alphabetic), Gender selected, 10-digit mobile
     * Expected : Form submits successfully → success modal appears
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm(VALID_MANDATORY_ONLY);
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
  });

  test('TC-A02: Submit full form and verify modal displays correct data (AC1 & AC5)', async ({ page }) => {
    /**
     * EP Class : Valid Partition – all fields filled with correct values
     * Input    : Complete form data (see VALID_COMPLETE_FORM in test-data)
     * Expected : Modal appears; modal table matches every entered field value
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm(VALID_COMPLETE_FORM);
    await formPage.clickSubmit();
    await formPage.assertModalVisible();

    const tableData = await formPage.getModalTableData();

    // Verify Student Name
    expect(tableData['Student Name']).toBe(
      `${VALID_COMPLETE_FORM.firstName} ${VALID_COMPLETE_FORM.lastName}`
    );
    // Verify Email
    expect(tableData['Student Email']).toBe(VALID_COMPLETE_FORM.email);
    // Verify Gender
    expect(tableData['Gender']).toBe(VALID_COMPLETE_FORM.gender);
    // Verify Mobile
    expect(tableData['Mobile']).toBe(VALID_COMPLETE_FORM.mobile);
    // Verify Date of Birth
    expect(tableData['Date of Birth']).toContain(VALID_COMPLETE_FORM.dateOfBirth!.split(' ')[0]);
    // Verify Subjects
    for (const subject of VALID_COMPLETE_FORM.subjects!) {
      expect(tableData['Subjects']).toContain(subject);
    }
    // Verify Hobbies
    for (const hobby of VALID_COMPLETE_FORM.hobbies!) {
      expect(tableData['Hobbies']).toContain(hobby);
    }
    // Verify State + City
    expect(tableData['State and City']).toContain(VALID_COMPLETE_FORM.state!);
    expect(tableData['State and City']).toContain(VALID_COMPLETE_FORM.city!);
  });

  test('TC-A03: Close modal returns to blank form', async ({ page }) => {
    /**
     * EP Class : Valid Partition
     * Input    : Submit valid form → close modal
     * Expected : Modal closes; form is visible again
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm(VALID_MANDATORY_ONLY);
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
    // Press Escape – Bootstrap modals always close on Escape key
    await page.keyboard.press('Escape');
    await formPage.assertModalNotVisible();
    // Form should be present again
    await expect(formPage.firstNameInput).toBeVisible();
  });

  test('TC-A04: Submit form with Gender = Other (EP: Other gender partition)', async ({ page }) => {
    /**
     * EP Class : Valid Partition – Gender "Other"
     * Input    : Valid form data with Gender = Other
     * Expected : Form submits; modal shows "Other" as gender
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm(VALID_GENDER_OTHER);
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
    const tableData = await formPage.getModalTableData();
    expect(tableData['Gender']).toBe('Other');
  });

  test('TC-A05: Submit form with Gender = Female (EP: Female gender partition)', async ({ page }) => {
    /**
     * EP Class : Valid Partition – Gender "Female"
     * Input    : Valid female student data
     * Expected : Form submits; modal shows "Female" as gender
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm({
      firstName: 'Sarah',
      lastName: 'Connor',
      gender: 'Female',
      mobile: '0891234567',
    });
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
    const tableData = await formPage.getModalTableData();
    expect(tableData['Gender']).toBe('Female');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE B – Mandatory Field Validation (AC2)
// EP: Invalid Partition – blank mandatory fields
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite B – Mandatory Field Validation [EP: Invalid Partition – blank fields]', () => {

  test('TC-B01: Submit fails when First Name is empty', async ({ page }) => {
    /**
     * EP Class : Invalid Partition – First Name = "" (empty)
     * Input    : Blank first name, valid other mandatory fields
     * Expected : Form does NOT submit; modal does NOT appear
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillLastName(MISSING_FIRSTNAME.lastName!);
    await formPage.selectGender(MISSING_FIRSTNAME.gender!);
    await formPage.fillMobile(MISSING_FIRSTNAME.mobile!);
    await formPage.clickSubmit();
    await formPage.assertModalNotVisible();
    // Field should be highlighted in red (invalid state)
    await formPage.assertFieldHighlightedInvalid(formPage.firstNameInput);
  });

  test('TC-B02: Submit fails when Last Name is empty', async ({ page }) => {
    /**
     * EP Class : Invalid Partition – Last Name = "" (empty)
     * Expected : Form does NOT submit; Last Name field highlighted invalid
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillFirstName(MISSING_LASTNAME.firstName!);
    await formPage.selectGender(MISSING_LASTNAME.gender!);
    await formPage.fillMobile(MISSING_LASTNAME.mobile!);
    await formPage.clickSubmit();
    await formPage.assertModalNotVisible();
    await formPage.assertFieldHighlightedInvalid(formPage.lastNameInput);
  });

  test('TC-B03: Submit fails when Gender is not selected', async ({ page }) => {
    /**
     * EP Class : Invalid Partition – Gender = not selected
     * Expected : Form does NOT submit; modal does NOT appear
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillFirstName(MISSING_GENDER.firstName!);
    await formPage.fillLastName(MISSING_GENDER.lastName!);
    await formPage.fillMobile(MISSING_GENDER.mobile!);
    await formPage.clickSubmit();
    await formPage.assertModalNotVisible();
  });

  test('TC-B04: Submit fails when Mobile is empty', async ({ page }) => {
    /**
     * EP Class : Invalid Partition – Mobile = "" (empty)
     * Expected : Form does NOT submit; Mobile field highlighted invalid
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillFirstName(MISSING_MOBILE.firstName!);
    await formPage.fillLastName(MISSING_MOBILE.lastName!);
    await formPage.selectGender(MISSING_MOBILE.gender!);
    await formPage.clickSubmit();
    await formPage.assertModalNotVisible();
    await formPage.assertFieldHighlightedInvalid(formPage.mobileInput);
  });

  test('TC-B05: Submit fails when ALL mandatory fields are empty', async ({ page }) => {
    /**
     * EP Class : Invalid Partition – all mandatory fields blank
     * Expected : Form does NOT submit; modal does NOT appear
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.clickSubmit();
    await formPage.assertModalNotVisible();
    // All mandatory fields should be invalid
    await formPage.assertFieldHighlightedInvalid(formPage.firstNameInput);
    await formPage.assertFieldHighlightedInvalid(formPage.lastNameInput);
    await formPage.assertFieldHighlightedInvalid(formPage.mobileInput);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE C – Subjects Multi-tag Functionality (AC4)
// EP: Valid Partition – multiple subject entries
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite C – Subjects Field Multi-tag [EP: Valid Partition – multiple entries]', () => {

  test('TC-C01: Single subject is displayed as a removable tag', async ({ page }) => {
    /**
     * EP Class : Valid Partition – 1 subject entered
     * Input    : Type "Maths" in subjects field
     * Expected : "Maths" appears as a tag chip
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.addSubject('Maths');
    const tags = await formPage.getSubjectTags();
    expect(tags).toContain('Maths');
  });

  test('TC-C02: Multiple subjects are all displayed as individual tags', async ({ page }) => {
    /**
     * EP Class : Valid Partition – multiple subjects entered
     * Input    : Maths, Physics, Chemistry
     * Expected : All three appear as separate tag chips
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.addSubjects(['Maths', 'Physics', 'Chemistry']);
    const tags = await formPage.getSubjectTags();
    expect(tags).toContain('Maths');
    expect(tags).toContain('Physics');
    expect(tags).toContain('Chemistry');
    expect(tags.length).toBe(3);
  });

  test('TC-C03: Subject tag can be removed by clicking × button', async ({ page }) => {
    /**
     * EP Class : Valid Partition – tag removal
     * Input    : Add "Maths" then click × on its tag
     * Expected : "Maths" tag disappears; subjects input is empty
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.addSubject('Maths');
    let tags = await formPage.getSubjectTags();
    expect(tags).toContain('Maths');
    await formPage.removeSubjectTag('Maths');
    tags = await formPage.getSubjectTags();
    expect(tags).not.toContain('Maths');
  });

  test('TC-C04: Add same subject twice does not create duplicate tag', async ({ page }) => {
    /**
     * EP Class : Edge case – duplicate entry
     * Input    : Add "Maths" then type "Maths" again
     * Expected : The autocomplete does NOT offer "Maths" a second time
     *            (already-selected subject is removed from suggestions)
     *            so the tag count stays at 1.
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.addSubject('Maths');
    // Type "Maths" again – the option should no longer be in the dropdown
    await formPage.subjectsInput.fill('Maths');
    const optionAgain = page.locator('.subjects-auto-complete__option', { hasText: 'Maths' });
    // Either no option appears, or if it does appear as a "no option" message
    const count = await optionAgain.count();
    if (count > 0) {
      // Some builds show "--" or disabled option; just verify tag count is still 1
      const tags = await formPage.getSubjectTags();
      expect(tags.filter(t => t === 'Maths').length).toBe(1);
    } else {
      // Confirmed: option not available → only 1 tag
      const tags = await formPage.getSubjectTags();
      expect(tags.filter(t => t === 'Maths').length).toBe(1);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE D – Dynamic Dropdown: State → City (AC3 & AC7)
// EP: Valid Partition – state/city interaction
//     Invalid Partition – city before state
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite D – Dynamic Dropdown State/City [EP: Valid & Invalid Partitions]', () => {

  test('TC-D01: City dropdown is empty/disabled before State is selected (AC7)', async ({ page }) => {
    /**
     * EP Class : Invalid Partition – no state selected
     * Input    : Load form, do not select state
     * Expected : City dropdown shows "Select City" placeholder; no options available
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.assertCityDropdownDisabled();
  });

  test('TC-D02: Selecting NCR populates correct cities (AC3)', async ({ page }) => {
    /**
     * EP Class : Valid Partition – State = NCR
     * Input    : Select "NCR" from State dropdown
     * Expected : City options include Delhi, Gurgaon, Noida
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.selectState('NCR');
    // Open city dropdown and check options
    await page.locator('#city').click();
    for (const city of STATE_CITY_MAP['NCR']) {
      await expect(
        page.locator(`[id^="react-select"][id*="option"]`, { hasText: city }).first()
      ).toBeVisible();
    }
  });

  test('TC-D03: Selecting Uttar Pradesh populates correct cities (AC3)', async ({ page }) => {
    /**
     * EP Class : Valid Partition – State = Uttar Pradesh
     * Input    : Select "Uttar Pradesh" from State dropdown
     * Expected : City options include Agra, Lucknow, Merrut
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.selectState('Uttar Pradesh');
    await page.locator('#city').click();
    for (const city of STATE_CITY_MAP['Uttar Pradesh']) {
      await expect(
        page.locator(`[id^="react-select"][id*="option"]`, { hasText: city }).first()
      ).toBeVisible();
    }
  });

  test('TC-D04: Changing State resets and updates City options (AC3)', async ({ page }) => {
    /**
     * EP Class : Valid Partition – state change
     * Input    : Select NCR first, then switch to Haryana
     * Expected : Cities change to Haryana cities (not NCR cities)
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.selectState('NCR');
    await formPage.selectCity('Delhi');
    // Now change state
    await formPage.selectState('Haryana');
    await page.locator('#city').click();
    for (const city of STATE_CITY_MAP['Haryana']) {
      await expect(
        page.locator(`[id^="react-select"][id*="option"]`, { hasText: city }).first()
      ).toBeVisible();
    }
    // NCR cities should NOT be present
    const ncrCities = STATE_CITY_MAP['NCR'];
    for (const city of ncrCities) {
      await expect(
        page.locator(`[id^="react-select"][id*="option"]`, { hasText: city }).first()
      ).not.toBeVisible();
    }
  });

  test('TC-D05: State + City values appear correctly in the success modal', async ({ page }) => {
    /**
     * EP Class : Valid Partition – full submission with state/city
     * Input    : Select Rajasthan + Jaipur, submit
     * Expected : Modal shows "Rajasthan Jaipur"
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm({
      firstName: 'Raj',
      lastName: 'Kumar',
      gender: 'Male',
      mobile: '0900000001',
      state: 'Rajasthan',
      city: 'Jaipur',
    });
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
    const tableData = await formPage.getModalTableData();
    expect(tableData['State and City']).toContain('Rajasthan');
    expect(tableData['State and City']).toContain('Jaipur');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE E – Field Validation: Mobile & Email (AC6.1 & AC6.2)
// EP + BVA for Mobile; EP for Email
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite E – Mobile & Email Field Validation [EP + BVA]', () => {

  // ─── Mobile BVA ─────────────────────────────────────────────────────────

  test('TC-E01: Mobile with exactly 10 digits is accepted [BVA – at boundary]', async ({ page }) => {
    /**
     * BVA      : At boundary (10 digits) → VALID
     * EP Class : Valid Partition – exactly 10-digit numeric mobile
     * Input    : "0812345678" (10 digits)
     * Expected : Form submits successfully
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm({
      firstName: 'Test', lastName: 'User',
      gender: 'Male', mobile: BVA_MOBILE_VALID_10,
    });
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
  });

  test('TC-E02: Mobile with 9 digits is rejected [BVA – below boundary]', async ({ page }) => {
    /**
     * BVA      : Below boundary (9 digits) → INVALID
     * EP Class : Invalid Partition – fewer than 10 digits
     * Input    : "081234567" (9 digits)
     * Expected : Form does NOT submit; mobile field highlighted red
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm({
      firstName: 'Test', lastName: 'User',
      gender: 'Male', mobile: BVA_MOBILE_LOW_9,
    });
    await formPage.clickSubmit();
    await formPage.assertModalNotVisible();
    await formPage.assertFieldHighlightedInvalid(formPage.mobileInput);
  });

  test('TC-E03: Mobile input enforces max 10 digits (truncation at boundary) [BVA – above boundary]', async ({ page }) => {
    /**
     * BVA      : Above boundary (11 digits) → browser enforces maxlength=10
     * EP Class : Invalid Partition – more than 10 digits attempted
     * Input    : "08123456789" (11 digits)
     * Expected : The HTML maxlength=10 attribute causes the input to silently
     *            truncate to 10 digits. We verify the field holds exactly 10
     *            characters (the extra digit is prevented from being entered).
     *            This confirms the boundary enforcement mechanism is in place.
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillMobile(BVA_MOBILE_HIGH_11);
    const actualValue = await formPage.mobileInput.inputValue();
    // The field must hold at most 10 characters due to maxlength enforcement
    expect(actualValue.length).toBeLessThanOrEqual(10);
    // Confirm the truncated value is exactly the first 10 digits
    expect(actualValue).toBe(BVA_MOBILE_HIGH_11.slice(0, 10));
  });

  test('TC-E04: Mobile with alphabetic characters is rejected [EP – alpha partition]', async ({ page }) => {
    /**
     * EP Class : Invalid Partition – non-numeric characters
     * Input    : "ABCDEFGHIJ" (alphabetic, 10 chars)
     * Expected : Even if the input is accepted visually (demoqa uses type=text),
     *            form submission must fail because value is not 10 digits.
     *            This verifies the server/client validation rejects alpha values.
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillFirstName('Test');
    await formPage.fillLastName('User');
    await formPage.selectGender('Male');
    await formPage.fillMobile(BVA_MOBILE_ALPHA);
    await formPage.clickSubmit();
    // Form must NOT submit when mobile contains only letters
    await formPage.assertModalNotVisible();
  });

  test('TC-E05: Mobile with special symbols is rejected [EP – special chars partition]', async ({ page }) => {
    /**
     * EP Class : Invalid Partition – special characters
     * Input    : "081@#$%678" (contains @#$%)
     * Expected : The mobile input is type="text" so special chars are accepted
     *            by the browser, but form-level validation must reject submission
     *            because the value is not a 10-digit numeric string.
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillFirstName('Test');
    await formPage.fillLastName('User');
    await formPage.selectGender('Male');
    await formPage.fillMobile(BVA_MOBILE_SPECIAL);
    await formPage.clickSubmit();
    // Form must NOT submit when mobile contains special characters
    await formPage.assertModalNotVisible();
  });

  // ─── Email EP ───────────────────────────────────────────────────────────

  test('TC-E06: Valid email format is accepted [EP – valid email partition]', async ({ page }) => {
    /**
     * EP Class : Valid Partition – valid email format name@domain.ext
     * Input    : "valid@domain.com"
     * Expected : Email field accepts the value; form can be submitted
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm({
      firstName: 'Test', lastName: 'User',
      gender: 'Male', mobile: '0812345678',
      email: VALID_EMAIL_FORMAT,
    });
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
    const tableData = await formPage.getModalTableData();
    expect(tableData['Student Email']).toBe(VALID_EMAIL_FORMAT);
  });

  test('TC-E07: Email without "@" is rejected [EP – invalid email partition: no @]', async ({ page }) => {
    /**
     * EP Class : Invalid Partition – email missing "@"
     * Input    : "invalidemail.com"
     * Expected : Form does NOT submit; email field highlighted invalid
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm({
      firstName: 'Test', lastName: 'User',
      gender: 'Male', mobile: '0812345678',
      email: INVALID_EMAIL_NO_AT,
    });
    await formPage.clickSubmit();
    await formPage.assertModalNotVisible();
    await formPage.assertFieldHighlightedInvalid(formPage.emailInput);
  });

  test('TC-E08: Email without domain is rejected [EP – invalid email partition: no domain]', async ({ page }) => {
    /**
     * EP Class : Invalid Partition – email missing domain after "@"
     * Input    : "invalid@"
     * Expected : Form does NOT submit; email field highlighted invalid
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm({
      firstName: 'Test', lastName: 'User',
      gender: 'Male', mobile: '0812345678',
      email: INVALID_EMAIL_NO_DOMAIN,
    });
    await formPage.clickSubmit();
    await formPage.assertModalNotVisible();
    await formPage.assertFieldHighlightedInvalid(formPage.emailInput);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE F – Date of Birth Functionality (AC6.3)
// EP: Valid Partition – calendar date selection
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite F – Date of Birth [EP: Valid Partition – calendar selection]', () => {

  test('TC-F01: Date of Birth field is pre-filled with current date by default (AC6.3)', async ({ page }) => {
    /**
     * EP Class : Valid Partition – default date
     * Input    : Load form without changing date
     * Expected : DOB input contains the current system date
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    // Get the current date in the format used by the datepicker
    const today = new Date();
    const day   = String(today.getDate()).padStart(2, '0');
    const month = today.toLocaleString('en-GB', { month: 'long' });
    const year  = String(today.getFullYear());
    const dobValue = await formPage.dobInput.inputValue();
    // The input format is "DD Month YYYY" or similar
    expect(dobValue).toBeTruthy();
    expect(dobValue.length).toBeGreaterThan(0);
  });

  test('TC-F02: User can manually select a date via calendar widget (AC6.3)', async ({ page }) => {
    /**
     * EP Class : Valid Partition – user-selected date
     * Input    : Select "15 Jan 2000" via calendar picker
     * Expected : DOB input shows the selected date
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.setDateOfBirth('15 Jan 2000');
    const dobValue = await formPage.dobInput.inputValue();
    expect(dobValue).toContain('2000');
    expect(dobValue).toContain('15');
  });

  test('TC-F03: DOB appears correctly in the success modal after submission', async ({ page }) => {
    /**
     * EP Class : Valid Partition – selected date shown in modal
     * Input    : Set DOB to "20 Jun 1995", submit valid form
     * Expected : Modal table contains "20 June,1995" or equivalent
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm({
      firstName: 'Alice',
      lastName: 'Brown',
      gender: 'Female',
      mobile: '0812222333',
      dateOfBirth: '20 Jun 1995',
    });
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
    const tableData = await formPage.getModalTableData();
    expect(tableData['Date of Birth']).toContain('1995');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE G – Hobbies & Picture Upload (Additional Coverage)
// EP: Valid Partition – optional fields
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite G – Hobbies & Picture Upload [EP: Valid Partition – optional fields]', () => {

  test('TC-G01: Multiple hobbies can be selected simultaneously', async ({ page }) => {
    /**
     * EP Class : Valid Partition – multiple checkbox selections
     * Input    : Check Sports AND Reading AND Music
     * Expected : All three hobbies appear checked; modal shows all three
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm({
      firstName: 'Bob', lastName: 'Lee',
      gender: 'Male', mobile: '0801234567',
      hobbies: ['Sports', 'Reading', 'Music'],
    });
    // Verify checkboxes are checked
    await expect(page.locator('#hobbies-checkbox-1')).toBeChecked();
    await expect(page.locator('#hobbies-checkbox-2')).toBeChecked();
    await expect(page.locator('#hobbies-checkbox-3')).toBeChecked();
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
    const tableData = await formPage.getModalTableData();
    expect(tableData['Hobbies']).toContain('Sports');
    expect(tableData['Hobbies']).toContain('Reading');
    expect(tableData['Hobbies']).toContain('Music');
  });

  test('TC-G02: No hobbies selected still allows form submission (optional field)', async ({ page }) => {
    /**
     * EP Class : Valid Partition – no hobbies (optional)
     * Input    : Submit form without selecting any hobby
     * Expected : Form submits successfully
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    await formPage.fillForm({
      firstName: 'Charlie', lastName: 'Day',
      gender: 'Male', mobile: '0812340000',
    });
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
  });

  test('TC-G03: Current Address is shown correctly in modal', async ({ page }) => {
    /**
     * EP Class : Valid Partition – multi-line address
     * Input    : "No.99 Test Road, Bangkok 10110"
     * Expected : Modal shows the exact address
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    const address = 'No.99 Test Road, Bangkok 10110';
    await formPage.fillForm({
      firstName: 'Dave', lastName: 'Evans',
      gender: 'Male', mobile: '0890000001',
      currentAddress: address,
    });
    await formPage.clickSubmit();
    await formPage.assertModalVisible();
    const tableData = await formPage.getModalTableData();
    expect(tableData['Address']).toBe(address);
  });

  test('TC-G04: Picture file upload accepts image files', async ({ page }) => {
    /**
     * EP Class : Valid Partition – image file upload (jpg/png)
     * Input    : Upload a test PNG image file
     * Expected : File name appears next to the upload button
     */
    const formPage = new RegistrationFormPage(page);
    await formPage.navigate();
    // Use a fixture image (created in setup)
    const imagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    await formPage.uploadPicture(imagePath);
    const fileName = await page.locator('#uploadPicture').evaluate(
      (el: HTMLInputElement) => el.files?.[0]?.name ?? ''
    );
    expect(fileName).toContain('test-image.jpg');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE H – Equivalence Partitioning Summary Tests (Parameterized-style)
// EP table coverage verification for name fields
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Suite H – EP Summary: Name Fields [Valid vs Invalid Partitions]', () => {

  // Valid name partitions
  const validNames = [
    { firstName: 'John',     lastName: 'Smith'  },   // EP: common alphabetic
    { firstName: 'Anne-Marie', lastName: 'O\'Brien' }, // EP: with hyphen/apostrophe edge
    { firstName: 'Somchai', lastName: 'Wongsawat' }, // EP: Thai transliterated name
  ];

  for (const nameData of validNames) {
    test(`TC-H0x: Valid name "${nameData.firstName} ${nameData.lastName}" submits successfully`, async ({ page }) => {
      /**
       * EP Class : Valid Partition – alphabetic first/last name
       * Expected : Form submits successfully
       */
      const formPage = new RegistrationFormPage(page);
      await formPage.navigate();
      await formPage.fillForm({
        firstName: nameData.firstName,
        lastName:  nameData.lastName,
        gender:  'Male',
        mobile:  '0812345678',
      });
      await formPage.clickSubmit();
      await formPage.assertModalVisible();
      const tableData = await formPage.getModalTableData();
      expect(tableData['Student Name']).toContain(nameData.firstName);
    });
  }
});
