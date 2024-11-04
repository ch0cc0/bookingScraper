const { chromium } = require('playwright');
const fs = require('fs');

function findMedian(a,n)
{
    a.sort();

    if (n % 2 != 0)
        return a[n / 2];
 
    return (a[Math.floor((n-1)/2)] + 
            a[n / 2]) / 2;
}

(async () => {
    const browser = await chromium.launch({ headless: false });

    // Create a new browser context with the desired User-Agent
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
    });

    // Create a new page in the context
    const page = await context.newPage();

    const states = [
        'Georgia',
        'Nevada',
        'Texas',
        'Maryland',
        'California',
        'Delaware',
        'Florida',
        'Virginia',
        'Colorado',
        'Hawaii',
        'North Carolina',
        'Arizona',
        'New Jersey',
        'Utah',
        'Washington',
        'Connecticut',
        'South Carolina',
        'Illinois',
        'Alaska',
        'Rhode Island',
        'Massachusetts',
        'Pennsylvania',
        'New York',
        'Oregon',
        'Nebraska',
        'Idaho',
        'Louisiana',
        'Indiana',
        'Minnesota',
        'Tennessee',
        'New Mexico',
        'Wisconsin',
        'New Hampshire',
        'Oklahoma',
        'Missouri',
        'Alabama',
        'Ohio',
        'Mississippi',
        'Kansas',
        'Michigan',
        'Kentucky',
        'Arkansas',
        'Maine',
        'Montana',
        'Iowa',
        'North Dakota',
        'Vermont',
        'South Dakota',
        'Wyoming',
        'West Virginia'
    ];
    const hotelData = [];

    for (const state of states) {
        const url = `https://www.booking.com/searchresults.html?ss=${state}&checkin=2024-12-01&checkout=2024-12-02&no_rooms=1&group_adults=1&group_children=0&shw_aparth=0&nflt=ht_id%3D204&order=price`;
        console.log(`Go to URL:\n${url}`);
        
        await page.goto(url, { timeout: 60000 }); // Increase the timeout to 60 seconds

        try {
            // Wait for the hotels to load (increase timeout for waiting)
            await page.waitForSelector('[data-testid="price-and-discounted-price"]', { timeout: 20000 }); // 45 seconds

            const lowestPrice = await page.$eval('[data-testid="price-and-discounted-price"]', element => parseFloat(element.textContent.trim().replace('£', '').replace(',', '')));

            // Extract the price text
            const prices = await page.$$eval('[data-testid="price-and-discounted-price"]', elements => 
                elements.slice(0, 30).map(el => {
                    const priceText = el.textContent.trim().replace('£', '').replace(',', ''); // Remove '£' and any commas
                    return parseFloat(priceText); // Convert to a float number
                })
            );


            let lengthOfPrices = prices.length;
            let sum = 0;
            for (let i = 0; i < lengthOfPrices; i++)
                sum += prices[i];
        
            let meanPrice = (sum / lengthOfPrices).toFixed(2);;
            let medianPrice = findMedian(prices, lengthOfPrices).toFixed(2);;

            hotelData.push({ state, lowestPrice, meanPrice,  medianPrice});

        } catch (error) {
            await page.screenshot({ path: `../img/screenshot-${state}.png` });
            console.error(`Error scraping ${state}: ${error.message}`);
            hotelData.push({ state, price: 'Not Available' });
        }
    }

    // Save to JSON file
    fs.writeFileSync('../data/hotel_data.json', JSON.stringify(hotelData, null, 2));

    await browser.close();
})();