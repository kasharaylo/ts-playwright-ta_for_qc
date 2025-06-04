import { test, expect } from '@playwright/test'

test('Sign Up', async ({ page }) => {
    await page.goto('https://gitlab.testautomate.me/users/sign_up')
    
    await page.fill('#new_user_first_name', 'testFirstName')
    await page.fill('#new_user_last_name', 'testLastName')
    await page.fill('#new_user_username', 'testUsername')
    await page.getByLabel('Username or email').fill('test@eample.com')
    await page.getByLabel('Password').fill('testPassword')

    await page.getByRole('button', { name: "Register" }).click()
    await expect(page).toHaveURL('https://gitlab.testautomate.me/users/sign_up/welcome')
})

test('Sign In', async ({ page }) => {
    await page.goto('https://gitlab.testautomate.me/users/sign_in')
    
    await page.getByLabel('Username or email').fill('test@eample.com')
    await page.getByLabel('Password').fill('testPassword')
    
    await page.getByRole('checkbox', {name: 'Remember Me'}).check({force: true})
    await page.getByRole('button', { name: "Sign in" }).click()
    await expect(page).toHaveURL('https://gitlab.testautomate.me/users/sign_up/welcome')

})