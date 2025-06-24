import { test, expect } from '@playwright/test'
import { userData } from '../testData/users.data'
import { RegisterPage, SignInPage } from '../pages/register.page'
import * as fs from 'fs/promises'
import * as path from 'path'

const userFilePath = path.resolve(__dirname, '../testData/registeredUser.json')

test('Sign Up', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await page.goto('https://gitlab.testautomate.me/users/sign_up');
    
    await registerPage.fillregistrationForm();
    await expect(page).toHaveURL('https://gitlab.testautomate.me/users/sign_up/welcome');

    // Save registered user info to file
    await fs.writeFile(userFilePath, JSON.stringify({
        email: userData.email,
        password: userData.password
    }, null, 2));
})

test('Sign In', async ({ page }) => {
    const signInPage = new SignInPage(page);
    
    // Read user info from file
    const userData = await fs.readFile(userFilePath, 'utf-8');
    const registeredUser = JSON.parse(userData);

    await page.goto('https://gitlab.testautomate.me/users/sign_in');
    await signInPage.userName.fill(registeredUser.email);
    await signInPage.password.fill(registeredUser.password);
    await signInPage.rememberMe.check({ force: true });
    await signInPage.signInButton.click();

    await expect(page).toHaveURL('https://gitlab.testautomate.me/users/sign_up/welcome');
});