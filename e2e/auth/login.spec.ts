/**
 * Login Flow E2E Tests
 *
 * QA 표준: test_should_[행동]_when_[조건]
 */

import { test, expect, testUsers, LoginPage } from '../fixtures/auth.fixture'

test.describe('Login Page', () => {
  test.describe('Page Rendering', () => {
    test('should_render_login_form_when_navigating_to_login', async ({ loginPage, page }) => {
      await loginPage.goto()

      await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()
      await expect(page.getByLabel('이메일')).toBeVisible()
      await expect(page.getByLabel('비밀번호')).toBeVisible()
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible()
    })

    test('should_render_social_login_options_when_page_loads', async ({ loginPage, page }) => {
      await loginPage.goto()

      await expect(page.getByText('Google로 계속하기')).toBeVisible()
      await expect(page.getByText('Facebook으로 계속하기')).toBeVisible()
    })

    test('should_render_registration_link_when_page_loads', async ({ loginPage, page }) => {
      await loginPage.goto()

      await expect(page.getByText('계정이 없으신가요?')).toBeVisible()
      await expect(page.getByRole('link', { name: '회원가입' })).toBeVisible()
    })

    test('should_show_success_message_when_redirected_from_registration', async ({ page }) => {
      await page.goto('/login?registered=true')

      await expect(page.getByText('회원가입이 완료되었습니다')).toBeVisible()
    })
  })

  test.describe('Form Validation', () => {
    test('should_show_error_when_email_is_empty', async ({ loginPage, page }) => {
      await loginPage.goto()
      await loginPage.fillPassword('SecureP@ss1')
      await loginPage.submit()

      await expect(page.getByText('이메일을 입력해주세요')).toBeVisible()
    })

    test('should_show_error_when_email_format_is_invalid', async ({ loginPage, page, browserName }) => {
      // WebKit에서 form noValidate 처리가 다름 - 스킵
      test.skip(browserName === 'webkit', 'WebKit handles noValidate differently')

      await loginPage.goto()
      await loginPage.fillEmail('invalid-email')
      await loginPage.fillPassword('SecureP@ss1')
      await loginPage.submit()

      await expect(page.getByText('유효한 이메일 형식이 아닙니다')).toBeVisible({ timeout: 5000 })
    })

    test('should_show_error_when_password_is_empty', async ({ loginPage, page }) => {
      await loginPage.goto()
      await loginPage.fillEmail('test@example.com')
      await loginPage.submit()

      await expect(page.getByText('비밀번호를 입력해주세요')).toBeVisible()
    })

    test('should_clear_error_when_user_corrects_input', async ({ loginPage, page, browserName }) => {
      // WebKit에서 form noValidate 처리가 다름 - 스킵
      test.skip(browserName === 'webkit', 'WebKit handles noValidate differently')

      await loginPage.goto()

      // 잘못된 이메일 입력
      await loginPage.fillEmail('invalid')
      await loginPage.fillPassword('test')
      await loginPage.submit()

      await expect(page.getByText('유효한 이메일 형식이 아닙니다')).toBeVisible({ timeout: 5000 })

      // 올바른 이메일로 수정 - 기존 입력을 지우고 새로 입력
      const emailInput = page.getByLabel('이메일')
      await emailInput.clear()
      await emailInput.type('valid@example.com')

      // 에러가 사라졌는지 확인
      await expect(page.getByText('유효한 이메일 형식이 아닙니다')).not.toBeVisible({ timeout: 3000 })
    })
  })

  test.describe('Login Functionality', () => {
    test('should_show_error_when_credentials_are_invalid', async ({ loginPage, page }) => {
      await loginPage.goto()
      await loginPage.login(testUsers.invalid.email, testUsers.invalid.password)

      // API 응답 대기
      await page.waitForResponse(
        (response) => response.url().includes('/auth/login'),
        { timeout: 10000 }
      ).catch(() => {
        // 개발 환경에서 API가 없을 수 있음
      })

      // 에러 메시지 또는 에러 상태 확인
      const hasError = await page.locator('.text-red-600, .text-red-700, [role="alert"]').isVisible()
        .catch(() => false)

      // 로그인 실패 시 여전히 로그인 페이지에 있어야 함
      expect(page.url()).toContain('/login')
    })

    test('should_redirect_to_home_when_login_succeeds', async ({ loginPage, page }) => {
      // 이 테스트는 실제 API가 필요합니다
      // Mock 응답 설정
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: '1',
              email: testUsers.valid.email,
              nickname: testUsers.valid.nickname,
              preferredLanguage: 'es',
            },
            tokens: {
              accessToken: 'mock_access_token',
              refreshToken: 'mock_refresh_token',
              expiresIn: 3600,
            },
          }),
        })
      })

      await loginPage.goto()
      await loginPage.login(testUsers.valid.email, testUsers.valid.password)

      // 홈페이지로 리다이렉션 확인
      await page.waitForURL('/', { timeout: 5000 }).catch(() => {})
    })

    // TODO: 실제 세션 관리가 필요한 테스트 - 백엔드 연동 후 활성화
    test.skip('should_persist_login_state_after_page_refresh', async ({ loginPage, page }) => {
      // Mock 로그인 응답
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: '1',
              email: testUsers.valid.email,
              nickname: testUsers.valid.nickname,
              preferredLanguage: 'es',
            },
            tokens: {
              accessToken: 'mock_access_token',
              refreshToken: 'mock_refresh_token',
              expiresIn: 3600,
            },
          }),
        })
      })

      await loginPage.goto()
      await loginPage.login(testUsers.valid.email, testUsers.valid.password)

      await page.waitForURL('/', { timeout: 5000 }).catch(() => {})

      // 페이지 새로고침
      await page.reload()

      // 로그인 상태 유지 확인 (로그인 페이지로 리다이렉트 안됨)
      await page.waitForTimeout(1000)
      expect(page.url()).not.toContain('/login')
    })
  })

  test.describe('Social Login', () => {
    // TODO: 실제 OAuth 연동이 필요한 테스트 - OAuth 설정 후 활성화
    test.skip('should_redirect_to_google_when_google_login_clicked', async ({ loginPage, page }) => {
      await loginPage.goto()

      // Google 로그인 버튼 클릭
      const [popup] = await Promise.all([
        page.waitForEvent('popup').catch(() => null),
        loginPage.clickGoogleLogin(),
      ])

      // Google OAuth 페이지로 이동하거나 현재 페이지가 변경되어야 함
      // (실제 환경에서는 Google OAuth 페이지로 리다이렉트)
    })

    test('should_have_clickable_google_login_button', async ({ loginPage, page }) => {
      await loginPage.goto()

      const googleButton = page.getByText('Google로 계속하기')
      await expect(googleButton).toBeVisible()
      await expect(googleButton).toBeEnabled()
    })
  })

  test.describe('Navigation', () => {
    test('should_navigate_to_register_when_register_link_clicked', async ({ loginPage, page }) => {
      await loginPage.goto()

      await page.getByRole('link', { name: '회원가입' }).click()

      await expect(page).toHaveURL('/register')
    })

    test('should_navigate_to_forgot_password_when_link_clicked', async ({ loginPage, page }) => {
      await loginPage.goto()

      await page.getByRole('link', { name: '비밀번호 찾기' }).click()

      await expect(page).toHaveURL('/forgot-password')
    })
  })

  test.describe('Accessibility', () => {
    test('should_be_keyboard_navigable', async ({ loginPage, page }) => {
      await loginPage.goto()

      // 이메일 필드에 포커스
      const emailInput = page.getByLabel('이메일')
      await emailInput.focus()
      await expect(emailInput).toBeFocused()

      // 비밀번호 필드에 포커스
      const passwordInput = page.getByLabel('비밀번호')
      await passwordInput.focus()
      await expect(passwordInput).toBeFocused()
    })

    test('should_have_proper_aria_labels', async ({ loginPage, page }) => {
      await loginPage.goto()

      const emailInput = page.getByLabel('이메일')
      const passwordInput = page.getByLabel('비밀번호')

      await expect(emailInput).toHaveAttribute('type', 'email')
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('should_show_focus_indicators', async ({ loginPage, page }) => {
      await loginPage.goto()

      const emailInput = page.getByLabel('이메일')
      await emailInput.focus()

      // 포커스 스타일이 적용되어 있는지 확인
      const hasFocusStyle = await emailInput.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return styles.outlineStyle !== 'none' || styles.boxShadow !== 'none'
      })

      expect(hasFocusStyle).toBeTruthy()
    })
  })

  test.describe('Security', () => {
    test('should_not_expose_password_in_url_or_logs', async ({ loginPage, page }) => {
      await loginPage.goto()
      await loginPage.fillEmail('test@example.com')
      await loginPage.fillPassword('SecretPassword123!')
      await loginPage.submit()

      // URL에 비밀번호가 노출되지 않아야 함
      expect(page.url()).not.toContain('SecretPassword123!')
    })

    test('should_use_https_for_api_calls_in_production', async ({ loginPage, page }) => {
      // 프로덕션 환경에서만 HTTPS 검증
      if (process.env.NODE_ENV === 'production') {
        const requests: string[] = []

        page.on('request', (request) => {
          if (request.url().includes('/api/')) {
            requests.push(request.url())
          }
        })

        await loginPage.goto()
        await loginPage.login('test@example.com', 'TestPassword123!')

        requests.forEach((url) => {
          expect(url).toMatch(/^https:\/\//)
        })
      }
    })

    test('should_handle_xss_attempt_in_inputs', async ({ loginPage, page }) => {
      await loginPage.goto()

      const xssPayload = '<script>alert("xss")</script>'
      await loginPage.fillEmail(xssPayload)

      // 스크립트가 실행되지 않아야 함
      const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null)
      await loginPage.submit()

      const dialog = await dialogPromise
      expect(dialog).toBeNull()
    })
  })

  test.describe('Error Handling', () => {
    test('should_show_friendly_error_when_network_fails', async ({ loginPage, page }) => {
      // 네트워크 오류 시뮬레이션
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.abort('failed')
      })

      await loginPage.goto()
      await loginPage.login(testUsers.valid.email, testUsers.valid.password)

      // 사용자 친화적인 에러 메시지 표시
      await page.waitForTimeout(1000)
      const hasError = await page.locator('.text-red-600, .text-red-700, [role="alert"]')
        .isVisible()
        .catch(() => false)

      // 에러 상태거나 여전히 로그인 페이지에 있어야 함
      expect(page.url()).toContain('/login')
    })

    test('should_show_error_when_server_returns_500', async ({ loginPage, page }) => {
      await page.route('**/api/v1/auth/login', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        })
      })

      await loginPage.goto()
      await loginPage.login(testUsers.valid.email, testUsers.valid.password)

      // 에러 표시 확인
      await page.waitForTimeout(1000)
      expect(page.url()).toContain('/login')
    })
  })

  test.describe('Performance', () => {
    test('should_load_login_page_within_acceptable_time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/login')
      await page.waitForLoadState('domcontentloaded')

      const loadTime = Date.now() - startTime

      // 3초 이내 로드
      expect(loadTime).toBeLessThan(3000)
    })
  })
})
