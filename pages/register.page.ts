import { Locator, Page } from '@playwright/test';
import { userData } from '../testData/users.data';

// Page Object Model for registration and sign-in pages
export class RegisterPage {
    readonly page: Page;
    readonly firstName: Locator;
    readonly lastName: Locator;
    readonly userName: Locator;
    readonly email: Locator;
    readonly password: Locator;
    readonly registerButton: Locator;
    readonly signInLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstName = page.locator('#new_user_first_name');
        this.lastName = page.locator('#new_user_last_name');
        this.userName = page.locator('#new_user_username');
        this.email = page.locator('#new_user_email');
        this.password = page.locator('#new_user_password');
        this.registerButton = page.locator('[data-qa-selector="new_user_register_button"]');
        this.signInLink = page.locator('a[href="/users/sign_in?redirect_to_referer=yes"]');
    }

    async fillregistrationForm() {
        await this.firstName.fill(userData.firstName);
        await this.lastName.fill(userData.lastName);
        await this.userName.fill(userData.userName);
        await this.email.fill(userData.email);
        await this.password.fill(userData.password);
        await this.registerButton.click();
    }
}

export class SignInPage {
    readonly page: Page;
    readonly userName: Locator;
    readonly password: Locator;
    readonly rememberMe: Locator;
    readonly signInButton: Locator;
    readonly registerLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.userName = page.locator('#user_login');
        this.password = page.locator('#user_password');
        this.rememberMe = page.locator('#user_remember_me');
        this.signInButton = page.locator('[data-qa-selector="sign_in_button"]');
        this.registerLink = page.locator('[data-qa-selector="register_link"]');
    }

    async fillSignInForm() {
        await this.userName.fill('johndoe');
        await this.password.fill('TestP@ss123!');
        await this.rememberMe.check();
        await this.signInButton.click();
    }
}

// Old registration and sign-in locators
export const regisration = {
    firstName: '#new_user_first_name',
    lastName: '#new_user_last_name',
    userName: '#new_user_username',
    email: '#new_user_email',
    password: '#new_user_password',
    registerButton: '[data-qa-selector="new_user_register_button"]',
    signInLink: 'a[href="/users/sign_in?redirect_to_referer=yes"]',
}
export const signIn = {
    userName: '#user_login',
    password: '#user_password',
    rememberMe: '#user_remember_me',
    signInButton: '[data-qa-selector="sign_in_button"]',
    registerLink: '[data-qa-selector="register_link"]',
}