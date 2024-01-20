
Data from Houston Marathon 2022-2024 results: [Timing Productions Site](https://www.timingproductions.com/results-site/houston)

Quick node script to download results for all races and divisions from 2022 to 2024 as provided through [timingproductions.com/results-site/houston](https://www.timingproductions.com/results-site/houston).

## Summary of where to find Houston Marathon data

1. 2022-2024 results: [Timing Productions Site](https://www.timingproductions.com/results-site/houston)
    * Scraping needs simulated browser and actions
1. 2010-2019 results: [results.houstonmarathon.com/2010/](http://results.houstonmarathon.com/2010/) - [results.houstonmarathon.com/2019/](http://results.houstonmarathon.com/2019/)

This site seems like a good place to get the data, but I could not figure out how to get the division for each result: [houstonresults.com/search](http://www.houstonresults.com/search)

https://track.rtrt.me/e/HOU-2017 to https://track.rtrt.me/e/HOU-2024

https://www.chevronhoustonmarathon.com/participants/results/

## Analysis or visualization ideas

Data Jams are a place to practice data analysis, data cleaning, data scraping to augment datasets, data engineering, data visualization, data sketching, data whatever you please!

I did find some interesting ideas just with a Google search of "marathon datasets" to see what else has been done.

Some specific things I think could be fun:

1. Continue to get results longitudinally
1. Find the courses geo data (geojson, shp or whatever format available) over time to visualize
1. Subset in some way to scrape some results for point times from rtrt or use individual results link to do a timelapse visualization
1. Augment with bike racers "Crash the Course" data
1. Get data details for [legacy runners](http://www.houstonresults.com/legacyrunners)

## Would-be-nice

- [ ] Set up parallel scraping
- [ ] Refactor to be nicer, make things take commandline inputs, etc. etc.
- [ ] Script the scraping some of the other data sources
- [ ] Set up on cloud

## Other links

Can also be accessed on [data.world](https://data.world/houstondatavis/houston-marathon-2022-2024)

## How to run this scraper on your computer

```js
npm install
npx playwright install
npm run scrape:recent
```

Note that for now, the script will overwrite the existing data files in `./data/`.