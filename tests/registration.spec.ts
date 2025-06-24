import { test, expect } from '@playwright/test'
import { userData } from '../testData/users.data'
import { regisration, signIn } from '../pages/register.page'
import * as fs from 'fs/promises'
import * as path from 'path'

const userFilePath = path.resolve(__dirname, '../testData/registeredUser.json')

test('Sign Up', async ({ page }) => {
    await page.goto('https://gitlab.testautomate.me/users/sign_up')
    
    await page.fill(regisration.firstName, userData.firstName)
    await page.fill(regisration.lastName, userData.lastName)
    await page.fill(regisration.userName, userData.userName)
    await page.fill(regisration.email, userData.email)
    await page.fill(regisration.password, userData.password)

    await page.click(regisration.registerButton)
    await expect(page).toHaveURL('https://gitlab.testautomate.me/users/sign_up/welcome')

    // Save registered user info to file
    await fs.writeFile(userFilePath, JSON.stringify({
        email: userData.email,
        password: userData.password
    }, null, 2));
})

test('Sign In', async ({ page }) => {
    // Read user info from file
    const userData = await fs.readFile(userFilePath, 'utf-8')
    const registeredUser = JSON.parse(userData)

    await page.goto('https://gitlab.testautomate.me/users/sign_in')
    
    await page.fill(signIn.userName, registeredUser.email)
    await page.fill(signIn.password, registeredUser.password)
    await page.check(signIn.rememberMe, { force: true })

    await page.click(signIn.signInButton)
    // Adjust the expected URL if needed
    await expect(page).toHaveURL('https://gitlab.testautomate.me/users/sign_up/welcome')
})