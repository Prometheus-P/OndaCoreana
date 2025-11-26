/**
 * Auth Test Fixtures
 * 인증 관련 테스트 픽스처
 */

import { test as base, Page } from '@playwright/test'

// 테스트용 사용자 데이터
export const testUsers = {
  valid: {
    email: 'testuser@example.com',
    password: 'SecureP@ss1',
    nickname: 'TestUser',
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
}

// 페이지 객체
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async fillEmail(email: string) {
    await this.page.getByLabel('이메일').fill(email)
  }

  async fillPassword(password: string) {
    await this.page.getByLabel('비밀번호').fill(password)
  }

  async submit() {
    await this.page.getByRole('button', { name: '로그인' }).click()
  }

  async login(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submit()
  }

  async clickGoogleLogin() {
    await this.page.getByText('Google로 계속하기').click()
  }

  async getErrorMessage() {
    const errorElement = this.page.locator('.text-red-600, .text-red-700')
    return errorElement.textContent()
  }

  async getSuccessMessage() {
    const successElement = this.page.locator('.text-green-700')
    return successElement.textContent()
  }

  async isLoggedIn() {
    // 로그인 후 리다이렉션 확인
    await this.page.waitForURL('/', { timeout: 5000 }).catch(() => false)
    return this.page.url() === new URL('/', this.page.url()).href
  }
}

export class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/register')
  }

  async fillForm(data: {
    email: string
    password: string
    confirmPassword: string
    nickname: string
  }) {
    await this.page.getByLabel('이메일').fill(data.email)
    await this.page.getByLabel('비밀번호', { exact: true }).fill(data.password)
    await this.page.getByLabel('비밀번호 확인').fill(data.confirmPassword)
    await this.page.getByLabel('닉네임').fill(data.nickname)
  }

  async submit() {
    await this.page.getByRole('button', { name: '회원가입' }).click()
  }
}

// 확장된 테스트 픽스처
type AuthFixtures = {
  loginPage: LoginPage
  registerPage: RegisterPage
}

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await use(loginPage)
  },
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page)
    await use(registerPage)
  },
})

export { expect } from '@playwright/test'
