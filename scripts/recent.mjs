import { chromium } from 'playwright'
import { createObjectCsvWriter } from 'csv-writer'

import countries from '../countries.json' assert { type: "json" }

const OUTPUT_PATH = `./data`

const pagesCSVWriter = createObjectCsvWriter({
  path: `${OUTPUT_PATH}/pages.csv`,
  header: [
    { id: 'year', title: 'year'},
    { id: 'race', title: 'race'},
    { id: 'division', title: 'division'},
    { id: 'pageNumber', title: 'pageNumber'},
    { id: 'count', title: 'count'},
  ]
})
const resultsCSVWriter = createObjectCsvWriter({
  path: `${OUTPUT_PATH}/results.csv`,
  header: [
    { id: "year", title: 'year'},
    { id: "race", title: 'race'},
    { id: "division", title: 'division'},
    { id: "pageNumber", title: 'pageNumber'},
    { id: "racerName", title: 'racerName'},
    { id: "bib", title: 'bib'},
    { id: "city", title: 'city'},
    { id: "state", title: 'state'},
    { id: "countryCode", title: 'countryCode'},
    { id: "countryAbbrev", title: 'countryAbbrev'},
    { id: "gender", title: 'gender'},
    { id: "age", title: 'age'},
    { id: "placeOverall", title: 'placeOverall'},
    { id: "placeGender", title: 'placeGender'},
    { id: "placeAgeGroup", title: 'placeAgeGroup'},
    { id: "finishTime", title: 'finishTime'},
    { id: "pace", title: 'pace'},
    { id: "resultLink", title: 'resultLink'},
    { id: "countryName", title: 'countryName'},
  ]
})

const waitForTimeout = (timeout) => (new Promise((resolve, reject) => {
  setTimeout(resolve, timeout)
}))

const launchOptions = {
  headless: true,
}

const browser = await chromium.launch(launchOptions)
const context = await browser.newContext()
const page = await context.newPage()
await page.goto("https://www.timingproductions.com/results-site/houston")

const SEARCH_CONFIG = {
  year: {
    options: [
      '2024',
      '2023',
      '2022',
    ],
  },
  race: {
    options: [
      'marathon',
      'halfmarathon',
      '5k',
    ],
  },
  division: {
    options: [
      'Runner',
      'Wheelchair',
      'Handcycle',
      'Duo',
    ],
  },
}

let allData = []
let pages = []

for (const year of SEARCH_CONFIG.year.options)  {
  for (const race of SEARCH_CONFIG.race.options) {
    for (const division of SEARCH_CONFIG.division.options) {
      let pageNumber = 1
      await page.locator(`:nth-match(select, 1)`).selectOption(year)
      await page.locator(`:nth-match(select, 2)`).selectOption(race)
      await page.locator(`:nth-match(select, 3)`).selectOption(division)
      await page.getByRole('button', { name: 'Search' }).click()
      // console.log({
      //   year, race, division,
      // })

      while (true) {
        await waitForTimeout(5000)
        const resultsTable = await page.locator('[data-cb-name="cbTable"][title="Data table"]')
        const rows = await resultsTable.locator('[data-cb-name="data"]')

        const pageItem = {
          year, race, division, pageNumber, count: await rows.count()
        }

        pages.push(pageItem)
        await pagesCSVWriter.writeRecords([pageItem])

        const data = await rows.evaluateAll((row) => ((row || []).map((rowEl) => {
          const [nameIshCol, ...cols] = rowEl.querySelectorAll('td')
          const [nameEl, demoEl] = nameIshCol.querySelectorAll('div')
        
          const racerName = nameEl.innerText.trim()
          const [genderAge, bib, race, hometown] = demoEl.innerText.trim().split('|').map((item) => item.trim())
        
          const [gender, age] = genderAge.split('-')
          const [city, stateCountry] = hometown.split(',')
        
          const [blank, state, countryAbbrev] = stateCountry.split(' ')
          const flagImgEl = demoEl.querySelector('img')
          const flagURL = (flagImgEl || {src: ''}).src
          const [flagFilename, countryCode] = (flagURL.match('/([a-z]+)\.png$') || [undefined, undefined])
        
          const resultLinkCol = cols.pop()
          const resultLink = resultLinkCol.querySelector('a').href
          const [placeOverall, placeGender, placeAgeGroup, finishTime, pace] = cols.map((colEl) => colEl.innerText)
        
          return {
            racerName,
            bib,
            race,
            city,
            state,
            countryCode,
            countryAbbrev,
            gender,
            age: age * 1,
            placeOverall: placeOverall * 1,
            placeGender: placeGender * 1,
            placeAgeGroup: placeAgeGroup * 1,
            finishTime,
            pace,
            resultLink,
          }
        })))
        
        const processedData = data.map((item) => {
          const country = countries.find((country) => (country.alpha2 === item.countryCode))
          return {
            year,
            race,
            division,
            pageNumber,
            ...item,
            countryName: (country || {}).name,
          }
        })
        // console.log(processedData)

        allData = allData.concat(processedData)
        await resultsCSVWriter.writeRecords(processedData)

        const nextButtonCount = await page.locator('[data-cb-name="JumpToNext"]').count()
        if (nextButtonCount === 0) {
          break
        }
        pageNumber++
        await page.locator('[data-cb-name="JumpToNext"]').click()
      }
    }
  }
}
await browser.close()