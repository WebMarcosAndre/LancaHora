const puppeteer = require("puppeteer");
const monthToLaunch = 8;
var initialDay = 7;

const periods = [
  ["0900", "1300"],
  ["1400", "1800"],
];
const exceptionsDays = [];

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const tabToLog = "  -  ";

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    headless: process.argv[2] != "show",
    //args: ['--profile-directory="Profile 1"'],
    userDataDir: __dirname + "/\\fcTeam/",
  });

  // console.log(process.argv[2]);

  const page = await browser.newPage();
  const urlTimeSheet = "https://fcteam.fcamara.com.br/#/timesheet";
  await page.goto(urlTimeSheet, {
    timeout: 90000,
  });

  //const navigationPromise = page.waitForNavigation();

  const currentUrl = page.url();

  if (urlTimeSheet != currentUrl) {
    console.log("Redirected");
  } else {
    const data = new Date(new Date().getFullYear(), monthToLaunch - 1, 1);
    var lastDayToLaunch = new Date(data.getFullYear(), data.getMonth() + 1, 0);

    while (initialDay < lastDayToLaunch.getDate() + 1) {
      if (IsWeekday() && !exceptionsDays.includes(initialDay)) {
        for (let i = 0; i < periods.length; i++) {
          const period = periods[i];

          console.log(
            `Launching ${GetDateDescription()} | ${period[0]} - ${period[1]}`
          );

          await OpenPopUpAsync(page);

          await SelectDateAsync(page);

          await SelectClientAndProjectAsync(page);

          await SetHourAsync(page, period);

          await SaveAppointment(page);

          await ConfirmFutureDate(page, data);
        }

        await new Promise((resolve) => setTimeout(resolve, 10000));
      } else {
        console.log(`Skipping ${GetDateDescription()}`);
      }
      initialDay++;
    }

    await browser.close();
  }
})();

async function ConfirmFutureDate(page, data) {
  if (data > new Date()) {
    console.log(`${tabToLog}${tabToLog}ConfirmFutureDate`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await page.click("button.confirm");
  }
}

async function SaveAppointment(page) {
  console.log(`${tabToLog}SaveAppointment 7/7`);
  await page.click(
    "#tabNormal > form > div > div.form.ng-scope > div.form-group.btns-modal-appointment > button.btn.btn-default.inverse.ng-binding"
  );
}

async function OpenPopUpAsync(page) {
  console.log(`${tabToLog}OpenPopUpAsync 1/7`);
  await new Promise((resolve) => setTimeout(resolve, 10000));

  await page.waitForSelector(
    "#header > nav > div.navbar-right > ul > li.ng-scope > button"
  );

  await page.click(
    "#header > nav > div.navbar-right > ul > li.ng-scope > button"
  );
}

async function SelectMonthAsync(page) {
  console.log(`${tabToLog}SelectMonthAsync 2/7`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await page.waitForSelector(
    "#tabNormal > form > div > div.row.m-t.ng-scope > div > div > button > a"
  );

  await page.click(
    "#tabNormal > form > div > div.row.m-t.ng-scope > div > div > button > a"
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await page.click(
    "body > div.ng-not-empty.ng-valid.ng-valid-date-disabled > ul > li > div > table > thead > tr:nth-child(1) > th:nth-child(2) > button"
  );

  const monthToLaunchDescr = months[monthToLaunch - 1].toLowerCase();

  await page.$$eval(
    "body > div.ng-not-empty.ng-valid.ng-valid-date-disabled > ul > li > div > table > tbody tr",
    (rows, monthToLaunchDescr) => {
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");

        cells.forEach((cell, index) => {
          if (cell.innerText.trim().toLowerCase() == monthToLaunchDescr) {
            cell.querySelector("button").click();
          }
        });
      });
    },
    monthToLaunchDescr
  );
}

async function SelectDayAsync(page) {
  console.log(`${tabToLog}SelectDayAsync 3/7`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await page.$$eval(
    "body > div.ng-not-empty.ng-valid.ng-valid-date-disabled > ul > li > div > table tr",
    (rows, initialDay) => {
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");

        cells.forEach((cell, index) => {
          if (
            cell.innerText.trim().toLowerCase() ==
            initialDay.toString().padStart(2, "0")
          ) {
            cell.querySelector("button").click();
          }
        });
      });
    },
    initialDay
  );
}

async function SelectDateAsync(page) {
  await SelectMonthAsync(page);

  await SelectDayAsync(page);
}

async function SelectClientAsync(page, select2Element) {
  console.log(`${tabToLog}SelectClientAsync 4/7`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await select2Element[0].click();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  const firstItem = await page.$$(".select2-result-label");
  await firstItem[1].click();
}

async function SelectProjectAsync(page, select2Element) {
  console.log(`${tabToLog}SelectProjectAsync 5/7`);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await select2Element[1].click();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  const firstItem2 = await page.$$(".select2-result-label");
  await firstItem2[2].click();
}

async function SelectClientAndProjectAsync(page) {
  const select2Element = await page.$$(".select2-choice");

  await SelectClientAsync(page, select2Element);

  await SelectProjectAsync(page, select2Element);
}

async function SetHourAsync(page, period) {
  console.log(`${tabToLog}SetHourAsync 6/7`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  var inputIndex = 0;
  for (const hour of period) {
    const input = await page.$$(
      "#tabNormal > form > div > div.form.ng-scope > div:nth-child(6) > div:nth-child(2) > div > input"
    );
    input[inputIndex].focus();

    await new Promise((resolve) => setTimeout(resolve, 1000));
    for (const number of hour.split("")) {
      page.keyboard.type(number.toString());
    }
    inputIndex++;
  }
}

function IsWeekday() {
  const dayOfWeek = new Date(
    new Date().getFullYear(),
    monthToLaunch - 1,
    initialDay
  ).getDay();

  return dayOfWeek !== 0 && dayOfWeek !== 6;
}

function GetDateDescription() {
  const monthToLaunchDescr = months[monthToLaunch - 1].toLowerCase();
  const date = `${new Date().getFullYear()}-${monthToLaunchDescr}-${initialDay
    .toString()
    .padStart(2, "0")}`;
  return date;
}
