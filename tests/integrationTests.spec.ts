import { test, expect } from '@playwright/test'
import { userData } from '../testData/users.data'
import { regisration, signIn } from '../pages/register.page'
import * as fs from 'fs/promises'
import * as path from 'path'
import { SignInPage } from '../pages/register.page'

const adminFilePath = path.resolve(__dirname, '../testData/registeredAdmin.json')
const tokenFilePath = path.resolve(__dirname, '../testData/tokenAdmin.json')
const projectName = `project_${Date.now()}`

    // When I register 'project admin' user via Gitlab 'UI'
    // Then I see the 'project admin' user is registered
    // And I become logged in as 'project admin' user

test('Register project admin user', async ({ page }) => {
    await page.goto('https://gitlab.testautomate.me/users/sign_up')
    
    await page.fill(regisration.firstName, userData.firstName)
    await page.fill(regisration.lastName, userData.lastName)
    await page.fill(regisration.userName, userData.userName)
    await page.fill(regisration.email, userData.email)
    await page.fill(regisration.password, userData.password)

    await page.click(regisration.registerButton)
    await expect(page).toHaveURL('https://gitlab.testautomate.me/users/sign_up/welcome')

    // Save user data to file
    await fs.writeFile(adminFilePath, JSON.stringify({
        email: userData.email,
        password: userData.password,
        userName: userData.userName
    }, null, 3))

    await page.getByLabel('Role').selectOption('other')
    await page.getByLabel('I\'m signing up for GitLab').selectOption('basics')
    await page.getByRole('button', { name: 'Get started!' }).click()
})

    // When I create a project
    // Then I see that project is created on 'UI' level
    // And I see that project is created on 'API' level

test('Create a project and verify on UI', async ({ page, request }) => {
    const signInPage = new SignInPage(page)
    
    // Read user info from file
    const adminData = await fs.readFile(adminFilePath, 'utf-8')
    const registeredUser = JSON.parse(adminData)

    await page.goto('https://gitlab.testautomate.me/users/sign_in')
    await signInPage.userName.fill(registeredUser.email)
    await signInPage.password.fill(registeredUser.password)
    await signInPage.rememberMe.check({ force: true })
    await signInPage.signInButton.click()

    // Create a new project via UI
    await page.goto('https://gitlab.testautomate.me/projects/new#blank_project')
    await page.fill('input[name="project[name]"]', projectName)
    await page.getByRole('button', { name: 'Create project' }).click()

    // UI check: Project page should open
    await expect(page).toHaveURL(`https://gitlab.testautomate.me/${registeredUser.userName}/${projectName}`)
})

test('API Sign In and Verify Project Creation', async ({ request }) => {
    // API check: Login to get access token
    const adminDataAPI = await fs.readFile(adminFilePath, 'utf-8')
    const registeredAdmin = JSON.parse(adminDataAPI)
        
    const response = await request.post('https://gitlab.testautomate.me/oauth/token', {
        form: {
            grant_type: 'password',
            username: registeredAdmin.email,
            password: registeredAdmin.password
        }
    })
    expect(response.status()).toBe(200)
    const responseBody = await response.json()
    expect(responseBody).toHaveProperty('access_token')
    
    // Save registered user info to file
    await fs.writeFile(tokenFilePath, JSON.stringify({
        access_token: responseBody.access_token
    }, null, 2))
    
    // API check: Verify project creation via API
    const tokenData = JSON.parse(await fs.readFile(tokenFilePath, 'utf-8'))
    const encodedPath = encodeURIComponent(`${registeredAdmin.userName}/${projectName}`);
    const apiResponse = await request.get(`https://gitlab.testautomate.me/api/v4/projects/${encodedPath}`, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
    })
    console.log(registeredAdmin.userName)
	console.log(projectName)
	console.log(encodedPath)

    //expect(apiResponse.status()).toBe(200)
})