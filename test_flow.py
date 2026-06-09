import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating to http://localhost:5173/employee-login")
        await page.goto("http://localhost:5173/employee-login")
        await page.wait_for_load_state('networkidle')
        
        print("Logging in as ward_aeo")
        await page.fill('input[type="text"]', "ward_aeo")
        await page.fill('input[type="password"]', "admin123")
        await page.click('button[type="submit"]')
        
        await page.wait_for_timeout(2000)
        
        print("Checking URL")
        print("URL after login:", page.url)
        content = await page.content()
        if "Administrative Command" in content or "dashboard" in page.url.lower() or "dept" in page.url.lower():
            print("Login successful.")
        else:
            print("Login failed or didn't redirect correctly.")
            
        await browser.close()

asyncio.run(main())
