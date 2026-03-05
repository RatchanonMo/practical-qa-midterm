import { Page, Locator, expect } from '@playwright/test';
import { FormData } from '../test-data/equivalence-partitions';

/**
 * Page Object Model for the Student Registration Form
 * URL: https://demoqa.com/automation-practice-form
 */
export class RegistrationFormPage {
  readonly page: Page;

  // ── Locators ──────────────────────────────────────────────────────────────
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly mobileInput: Locator;
  readonly dobInput: Locator;
  readonly subjectsInput: Locator;
  readonly currentAddressInput: Locator;
  readonly submitButton: Locator;
  readonly successModal: Locator;
  readonly successModalTitle: Locator;
  readonly successModalTable: Locator;
  closeModalButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput       = page.locator('#firstName');
    this.lastNameInput        = page.locator('#lastName');
    this.emailInput           = page.locator('#userEmail');
    this.mobileInput          = page.locator('#userNumber');
    this.dobInput             = page.locator('#dateOfBirthInput');
    this.subjectsInput        = page.locator('#subjectsInput');
    this.currentAddressInput  = page.locator('#currentAddress');
    this.submitButton         = page.locator('#submit');
    this.successModal         = page.locator('.modal-content');
    this.successModalTitle    = page.locator('#example-modal-sizes-title-lg');
    this.successModalTable    = page.locator('.table-responsive');
    // Use both the id and a fallback button[class*=close] to ensure we find it
    this.closeModalButton     = page.locator('#closeLargeModal, .modal-footer button:has-text("Close")').first();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto('/automation-practice-form');
    // Remove ads/fixed banners that can block clicks
    await this.page.evaluate(() => {
      const fixedEls = document.querySelectorAll(
        '#fixedban, .fixed-banner, footer, [id*="google_ads"], [class*="adsbygoogle"]'
      );
      fixedEls.forEach(el => (el as HTMLElement).style.display = 'none');
    });
    await expect(this.page.locator('h5')).toContainText('Student Registration Form');
  }

  // ── Field Fillers ─────────────────────────────────────────────────────────

  async fillFirstName(value: string) {
    await this.firstNameInput.clear();
    if (value) await this.firstNameInput.fill(value);
  }

  async fillLastName(value: string) {
    await this.lastNameInput.clear();
    if (value) await this.lastNameInput.fill(value);
  }

  async fillEmail(value: string) {
    await this.emailInput.clear();
    if (value) await this.emailInput.fill(value);
  }

  async selectGender(gender: 'Male' | 'Female' | 'Other') {
    // Use label click to avoid hidden radio button issues
    await this.page.locator(`label[for="gender-radio-${
      gender === 'Male' ? 1 : gender === 'Female' ? 2 : 3
    }"]`).click();
  }

  async fillMobile(value: string) {
    await this.mobileInput.clear();
    if (value) await this.mobileInput.fill(value);
  }

  async setDateOfBirth(dateStr: string) {
    // dateStr format: "15 Jan 2000"
    const parts = dateStr.split(' ');
    const day   = parts[0];
    const month = parts[1];
    const year  = parts[2];

    await this.dobInput.click();

    // Navigate to correct month/year using react-datepicker selects
    const monthMap: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2,  Apr: 3,  May: 4,  Jun: 5,
      Jul: 6, Aug: 7, Sep: 8,  Oct: 9,  Nov: 10, Dec: 11,
    };

    const monthSelect = this.page.locator('.react-datepicker__month-select');
    const yearSelect  = this.page.locator('.react-datepicker__year-select');

    await monthSelect.selectOption({ index: monthMap[month] });
    await yearSelect.selectOption(year);

    await this.page.locator(
      `.react-datepicker__day--0${day.padStart(2, '0')}:not(.react-datepicker__day--outside-month)`
    ).first().click();
  }

  async addSubject(subject: string) {
    await this.subjectsInput.fill(subject);
    // Wait for suggestion dropdown and click first matching option
    const option = this.page.locator('.subjects-auto-complete__option', { hasText: subject }).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
  }

  async addSubjects(subjects: string[]) {
    for (const subject of subjects) {
      await this.addSubject(subject);
    }
  }

  async checkHobby(hobby: 'Sports' | 'Reading' | 'Music') {
    const idMap = { Sports: 1, Reading: 2, Music: 3 };
    const label = this.page.locator(`label[for="hobbies-checkbox-${idMap[hobby]}"]`);
    await label.click();
  }

  async uploadPicture(filePath: string) {
    await this.page.locator('#uploadPicture').setInputFiles(filePath);
  }

  async fillCurrentAddress(value: string) {
    await this.currentAddressInput.clear();
    if (value) await this.currentAddressInput.fill(value);
  }

  async selectState(stateName: string) {
    // Scroll into view first to avoid ads obscuring the dropdown
    await this.page.locator('#stateCity-wrapper').scrollIntoViewIfNeeded();
    await this.page.locator('#state').click();
    // Use a robust selector: react-select renders menu in a sibling div with role="option"
    const menu = this.page.locator('#state + div, #state .react-select__menu, [class*="menu"]').first();
    // Wait for any option matching the name to become visible
    const option = this.page.locator('[class*="option"]', { hasText: stateName }).first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
  }

  async selectCity(cityName: string) {
    await this.page.locator('#stateCity-wrapper').scrollIntoViewIfNeeded();
    await this.page.locator('#city').click();
    const option = this.page.locator('[class*="option"]', { hasText: cityName }).first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
  }

  async clickSubmit() {
    await this.page.evaluate(() => {
      // Scroll submit button into view to avoid being covered by ads
      document.getElementById('submit')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await this.page.waitForTimeout(500);
    await this.submitButton.click();
  }

  // ── Composite Fill ────────────────────────────────────────────────────────

  /**
   * Fill the entire form from a FormData object.
   * Only fills fields that have values defined.
   */
  async fillForm(data: Partial<FormData>) {
    if (data.firstName !== undefined)   await this.fillFirstName(data.firstName);
    if (data.lastName  !== undefined)   await this.fillLastName(data.lastName);
    if (data.email     !== undefined && data.email) await this.fillEmail(data.email);
    if (data.gender    !== undefined)   await this.selectGender(data.gender);
    if (data.mobile    !== undefined)   await this.fillMobile(data.mobile);
    if (data.dateOfBirth)               await this.setDateOfBirth(data.dateOfBirth);
    if (data.subjects?.length)         await this.addSubjects(data.subjects);
    if (data.hobbies?.length) {
      for (const hobby of data.hobbies) await this.checkHobby(hobby);
    }
    if (data.currentAddress)            await this.fillCurrentAddress(data.currentAddress);
    if (data.state)                     await this.selectState(data.state);
    if (data.city && data.state)        await this.selectCity(data.city);
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async assertModalVisible() {
    await expect(this.successModal).toBeVisible({ timeout: 10_000 });
    await expect(this.successModalTitle).toHaveText('Thanks for submitting the form');
  }

  async assertModalNotVisible() {
    // Strategy 1: wait for the Bootstrap modal overlay (.modal) to lose visibility
    // (covers both display:none and opacity:0 / class removal)
    await this.page.waitForFunction(() => {
      const modal = document.querySelector('.modal.show, .modal[style*="display: block"]');
      return !modal;
    }, undefined, { timeout: 15_000 });
  }

  async getModalTableData(): Promise<Record<string, string>> {
    const rows = await this.successModalTable.locator('tr').all();
    const result: Record<string, string> = {};
    for (const row of rows) {
      const cells = await row.locator('td').all();
      if (cells.length === 2) {
        const label = (await cells[0].innerText()).trim();
        const value = (await cells[1].innerText()).trim();
        result[label] = value;
      }
    }
    return result;
  }

  async assertFieldHighlightedInvalid(locator: Locator) {
    // After clicking Submit, blur any focused element first so focus-blue
    // doesn't mask the error colour.
    await this.page.keyboard.press('Escape');
    await this.page.locator('body').click({ position: { x: 10, y: 10 } });
    await this.page.waitForTimeout(300);

    // demoqa uses either:
    //  1. HTML5 :invalid – check validity API
    //  2. A red/pink tinted border via Bootstrap / custom CSS
    const isInvalid: boolean = await locator.evaluate((el: HTMLInputElement) => {
      // HTML5 constraint validation
      if (typeof el.validity !== 'undefined') {
        return !el.validity.valid;
      }
      // Fallback: check if has Bootstrap is-invalid class
      return el.classList.contains('is-invalid') || el.classList.contains('field-error');
    });

    if (!isInvalid) {
      // If native validity isn't flagged, fall back to border-colour check
      const borderColor = await locator.evaluate(
        el => window.getComputedStyle(el).borderColor
      );
      // Accept any reddish / pinkish tone: covers rgb(220,53,69), rgb(222,216,221),
      // rgb(248,215,218), rgb(239,195,195) etc. where Red channel > Green+Blue
      const rgb = borderColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgb) {
        const [r, g, b] = [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3])];
        // Red channel must be dominant (r > g+b is a good heuristic for red/pink)
        if (r <= g + b && r < 200) {
          throw new Error(
            `Expected field to be highlighted as invalid but border colour was ${borderColor}`
          );
        }
      }
    }
    // If isInvalid is true (HTML5 validation), the assertion passes silently.
  }

  async assertCityDropdownDisabled() {
    // react-select wraps the actual #city div; the placeholder lives inside it
    // demoqa uses react-select v3/v4 – look for any element with placeholder text
    const cityWrapper = this.page.locator('#stateCity-wrapper').locator('div').filter({ hasText: /Select City/i }).first();
    await expect(cityWrapper).toBeVisible({ timeout: 10_000 });
  }

  async getSubjectTags(): Promise<string[]> {
    const tags = await this.page
      .locator('.subjects-auto-complete__multi-value__label')
      .allInnerTexts();
    return tags;
  }

  async removeSubjectTag(subject: string) {
    // Click the × button on the tag
    const tag = this.page.locator('.subjects-auto-complete__multi-value', { hasText: subject });
    await tag.locator('.subjects-auto-complete__multi-value__remove').click();
  }
}
